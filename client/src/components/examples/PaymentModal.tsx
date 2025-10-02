import { useState } from 'react';
import PaymentModal from '../PaymentModal';
import { Button } from '@/components/ui/button';

export default function PaymentModalExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex justify-center">
      <Button onClick={() => setOpen(true)}>
        Open Payment Modal
      </Button>
      
      <PaymentModal 
        open={open}
        onOpenChange={setOpen}
        onPaymentSuccess={() => console.log('Payment successful!')}
        vehicleInfo={{}}
      />
    </div>
  );
}