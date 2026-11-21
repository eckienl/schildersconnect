const PATHS: Record<string, string> = {
  house: 'M3 11 12 3l9 8M5 9.5V21h14V9.5M10 21v-6h4v6',
  roller: 'M4 3h13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM18 5.5h2.5V11H11v3M9.5 14h3v7h-3z',
  pin: 'M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3zM8.5 12l2.5 2.5 4.5-5',
  handshake: 'M2 11l4-4 3 1 3-2 3 2 3-1 4 4-4 4M6 15l3 3a1.5 1.5 0 0 0 2-2M10 17l1.5 1.5a1.5 1.5 0 0 0 2-2M12.5 16l1 1a1.5 1.5 0 0 0 2-2l-3-3M2 11l4 4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6l2-8z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chat: 'M21 12a8 8 0 0 1-11.8 7L4 20l1-4.6A8 8 0 1 1 21 12z',
  building: 'M4 21V5l8-2v18M12 8h8v13M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01M2 21h20',
  coins: 'M12 7c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 4v5c0 1.7 3.6 3 8 3s8-1.3 8-3V4M4 9v5c0 1.7 3.6 3 8 3s8-1.3 8-3V9M4 14v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  camera: 'M4 7h3l2-3h6l2 3h3v13H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  euro: 'M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 6l-6 6 6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  door: 'M5 21V3h12v18M3 21h18M13.5 12h.01',
  brush: 'M14 4l6 6-8 8-6-6zM6 12l-3 3v6h6l3-3M16.5 6.5l1 1',
  spray: 'M5 10h8v11H5zM7 10V6h4v4M11 6h3M17 4h.01M19 6h.01M17 8h.01M20 3h.01',
  stairs: 'M3 21h5v-5h5v-5h5V6h3',
  wall: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v5M15 10v5M9 15v4',
};

export function Icon({ name, size = 22, className, strokeWidth = 1.9 }: { name: keyof typeof PATHS | string; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.check} />
    </svg>
  );
}
