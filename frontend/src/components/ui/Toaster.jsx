import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      position="bottom-right"
      toastOptions={{
        className:
          '!bg-white !border !border-[#D8D4CC] !text-[#171717] !font-sans !text-xs !shadow-dropdown !rounded-none',
        descriptionClassName: '!text-[#6F6B64] !font-mono !text-[10px] !tracking-wider',
        actionButtonStyle: {
          backgroundColor: '#171717',
          color: '#FFFFFF',
          borderRadius: '0px',
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontSize: '10px',
        },
        cancelButtonStyle: {
          backgroundColor: 'transparent',
          border: '1px solid #D8D4CC',
          color: '#6F6B64',
          borderRadius: '0px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontSize: '10px',
        },
      }}
    />
  );
}
