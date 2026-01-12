CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name VARCHAR(50),
  avatar_url TEXT
);

CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  UNIQUE(family_id, user_id)
);

CREATE TABLE public.family_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genres VARCHAR(50)[],
  year INTEGER,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

CREATE TABLE public.family_series_status (
  series_id UUID NOT NULL REFERENCES public.family_series(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'to-watch' CHECK (status IN ('to-watch', 'watched')),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  PRIMARY KEY (series_id, user_id)
);

CREATE TABLE public.family_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.family_series(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_series_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_comments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_member(f_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members
    WHERE family_id = f_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;


CREATE POLICY "Profiles are viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Members view family" ON families FOR SELECT USING (is_member(id));

CREATE POLICY "View family members" ON family_members FOR SELECT USING (is_member(family_id));

CREATE POLICY "Family series access" ON family_series FOR SELECT USING (is_member(family_id));
CREATE POLICY "Family series insert" ON family_series FOR INSERT WITH CHECK (is_member(family_id));
CREATE POLICY "Family series update" ON family_series FOR UPDATE USING (is_member(family_id));
CREATE POLICY "Family series delete" ON family_series FOR DELETE USING (is_member(family_id));

CREATE POLICY "View family statuses" ON family_series_status FOR SELECT USING (
  EXISTS (SELECT 1 FROM family_series fs WHERE fs.id = series_id AND is_member(fs.family_id))
);
CREATE POLICY "Manage own status" ON family_series_status FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "View family comments" ON family_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM family_series fs WHERE fs.id = series_id AND is_member(fs.family_id))
);
CREATE POLICY "Post own comments" ON family_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
