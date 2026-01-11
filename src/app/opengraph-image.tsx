import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Наши Сериалы';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#3b82f6',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        border: '20px solid black',
      }}
    >
      <div
        style={{
          background: '#a3e635',
          border: '8px solid black',
          padding: '40px 60px',
          transform: 'rotate(-2deg)',
          boxShadow: '20px 20px 0px 0px black',
          display: 'flex' /* ОБЯЗАТЕЛЬНО */,
          flexDirection: 'column' /* ОБЯЗАТЕЛЬНО */,
          alignItems: 'center',
        }}
      >
        <h1
          style={{ fontSize: 80, fontWeight: 900, margin: 0, display: 'flex' }}
        >
          НАШИ СЕРИАЛЫ
        </h1>
        <div
          style={{
            background: '#ec4899',
            padding: '10px 20px',
            border: '4px solid black',
            marginTop: 20,
            display: 'flex' /* ОБЯЗАТЕЛЬНО */,
          }}
        >
          <span
            style={{
              fontSize: 30,
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
            }}
          >
            ТРЕКЕР ДЛЯ ЛЮБИМЫХ ❤️
          </span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
