// src/components/ui/KPICard.tsx

type KPICardProps = {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
};

export default function KPICard({ title, value, icon }: KPICardProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
            <div>
                <p className="text-sm text-white-400">{title}</p>
                <h3 className="text-2xl font-semibold text-white mt-1">{value}</h3>
            </div>
            {icon && (
                <div className="text-gray-500">
                    {icon}
                </div>
            )}

        </div>
    );
}
