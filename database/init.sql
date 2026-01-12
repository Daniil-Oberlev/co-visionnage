CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name VARCHAR(50),
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  UNIQUE(family_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.family_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genres VARCHAR(50)[],
  year INTEGER,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_member(f_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = f_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles select" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "families_select" ON families FOR SELECT USING (owner_id = auth.uid() OR is_member(id));
CREATE POLICY "families_insert" ON families FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "members_select" ON family_members FOR SELECT USING (
  user_id = auth.uid() OR
  family_id IN (SELECT id FROM families WHERE owner_id = auth.uid())
);
CREATE POLICY "members_insert" ON family_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "series_select" ON family_series FOR SELECT USING (is_member(family_id));
CREATE POLICY "series_insert" ON family_series FOR INSERT WITH CHECK (is_member(family_id));
CREATE POLICY "series_delete" ON family_series FOR DELETE USING (is_member(family_id));

INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
