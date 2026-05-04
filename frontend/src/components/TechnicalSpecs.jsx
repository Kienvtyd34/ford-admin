import React from 'react';

const TechnicalSpecs = ({ specs }) => {
    if (!specs) return null;

    const specGroups = [
        {
            title: "📏 Kích thước & Trọng lượng",
            items: [
                { label: "Kích thước tổng thể", value: specs.dimensions?.overall },
                { label: "Chiều dài cơ sở", value: specs.dimensions?.wheelbase },
                { label: "Khoảng sáng gầm xe", value: specs.dimensions?.groundClearance },
                { label: "Trọng lượng bản thân", value: specs.dimensions?.weight },
            ]
        },
        {
            title: "⚙️ Động cơ & Vận hành",
            items: [
                { label: "Loại động cơ", value: specs.engine },
                { label: "Công suất cực đại", value: specs.power },
                { label: "Mô-men xoắn cực đại", value: specs.performance?.torque },
                { label: "Hộp số", value: specs.transmission },
                { label: "Hệ dẫn động", value: specs.performance?.driveTrain },
                { label: "Loại nhiên liệu", value: specs.fuelType },
            ]
        },
        {
            title: "🛡️ Tính năng An toàn & Công nghệ",
            // Hiển thị dạng danh sách các tính năng
            isList: true,
            items: specs.safetyFeatures || []
        }
    ];

    return (
        <div className="mt-12 space-y-8 max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-black text-blue-900 border-l-8 border-blue-900 pl-4 uppercase italic">
                Thông số kỹ thuật chi tiết
            </h2>

            <div className="grid grid-cols-1 gap-6">
                {specGroups.map((group, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <h3 className="font-bold text-lg text-gray-800">{group.title}</h3>
                        </div>
                        
                        <div className="p-0">
                            {!group.isList ? (
                                <table className="w-full text-sm">
                                    <tbody>
                                        {group.items.map((item, i) => item.value && (
                                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                <td className="px-6 py-4 font-medium text-gray-500 w-1/3">{item.label}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                                    {group.items.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <span className="text-green-500">✔</span> {feature}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechnicalSpecs;