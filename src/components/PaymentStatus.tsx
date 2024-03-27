"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentStatusProps {
  orderEmail: string;
  orderId: string;
  isPaid: boolean;
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  const router = useRouter();
  const { data } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: isPaid === false,
      refetchInterval: () => (isPaid ? false : 1000), //will poll until isPaid is true with 1s interval
    }
  );
  useEffect(() => {
    if (data?.isPaid) router.refresh(); //refresh page after isPaid is true
  }, [data?.isPaid, router]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className=" font-medium text-gray-900">Shipping to</p>
        <p>{orderEmail}</p>
      </div>
      <div>
        <p className=" font-medium text-gray-900">Order Status</p>
        <p>{isPaid ? "Payment successful" : "Pending Payment"}</p>
      </div>
    </div>
  );
};

export default PaymentStatus;
