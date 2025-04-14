import type { SummaryItemProps } from "./types";

export default function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold">
          {value.toLocaleString("es-GT", {
            style: "currency",
            currency: "GTQ",
          })}
        </p>
      </div>
    </div>
  );
}
