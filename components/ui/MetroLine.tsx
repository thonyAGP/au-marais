import { cn } from '@/lib/utils';

// Couleurs officielles RATP
const lineColors: Record<string, { bg: string; text: string }> = {
  '1': { bg: '#FFCD00', text: '#000000' },
  '2': { bg: '#003CA6', text: '#FFFFFF' },
  '3': { bg: '#837902', text: '#FFFFFF' },
  '3bis': { bg: '#6EC4E8', text: '#000000' },
  '4': { bg: '#CF009E', text: '#FFFFFF' },
  '5': { bg: '#FF7E2E', text: '#000000' },
  '6': { bg: '#6ECA97', text: '#000000' },
  '7': { bg: '#FA9ABA', text: '#000000' },
  '7bis': { bg: '#6ECA97', text: '#000000' },
  '8': { bg: '#E19BDF', text: '#000000' },
  '9': { bg: '#B6BD00', text: '#000000' },
  '10': { bg: '#C9910D', text: '#000000' },
  '11': { bg: '#704B1C', text: '#FFFFFF' },
  '12': { bg: '#007852', text: '#FFFFFF' },
  '13': { bg: '#6EC4E8', text: '#000000' },
  '14': { bg: '#62259D', text: '#FFFFFF' },
};

interface MetroLineProps {
  line: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetroLine = ({ line, size = 'md', className }: MetroLineProps) => {
  const colors = lineColors[line] || { bg: '#888888', text: '#FFFFFF' };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-full',
        {
          'w-5 h-5 text-xs': size === 'sm',
          'w-7 h-7 text-sm': size === 'md',
          'w-9 h-9 text-base': size === 'lg',
        },
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
      title={`Ligne ${line}`}
    >
      {line}
    </span>
  );
};

interface MetroStationProps {
  line: string;
  station: string;
  distance?: string;
  destinations?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MetroStation = ({
  line,
  station,
  distance,
  destinations,
  size = 'md',
}: MetroStationProps) => {
  return (
    <div className="flex items-start gap-3">
      <MetroLine line={line} size={size} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-stone-900 font-medium">{station}</span>
          {distance && (
            <span className="text-stone-400 text-sm">· {distance}</span>
          )}
        </div>
        {destinations && (
          <p className="text-stone-500 text-sm mt-0.5">{destinations}</p>
        )}
      </div>
    </div>
  );
};
