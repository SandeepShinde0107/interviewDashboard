type CardProps = { title: string; value: number | string };
export const Card = ({ title, value }: CardProps) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <h3 className="font-semibold text-gray-600">{title}</h3>
    <p className="text-2xl font-bold text-blue-600">{value}</p>
  </div>
);
