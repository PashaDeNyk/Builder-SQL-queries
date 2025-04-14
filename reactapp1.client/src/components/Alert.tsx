interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
    children: React.ReactNode;
  }
  
  export function Alert({ variant = 'info', className, children }: AlertProps) {
    const variants = {
      info: 'bg-blue-50 text-blue-700',
      success: 'bg-green-50 text-green-700',
      warning: 'bg-yellow-50 text-yellow-700',
      error: 'bg-red-50 text-red-700',
    };
  
    return (
      <div
        className={`p-3 rounded-lg ${variants[variant]} ${className || ''}`}
        role="alert"
      >
        {children}
      </div>
    );
  }