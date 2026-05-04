import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';

const STATUS_LIST = ["Tất cả", "Trong kho", "Đã đặt cọc", "Đã bán", "Đang bảo trì"];

// ================= COLOR HELPER =================
const getColorHex = (name) => {
    const map = {
        "Đỏ": "#ef4444",
        "Trắng": "#ffffff",
        "Đen": "#000000",
        "Bạc": "#c0c0c0",
        "Xanh": "#3b82f6",
        "Xanh dương": "#2563eb",
        "Xanh lá": "#22c55e",
        "Nâu": "#8b5a2b",
        "Cam": "#f97316",
        "Vàng": "#eab308",
        "Ghi": "#6b7280",
    };
    return map[name] || "#ccc";
};

// ================= STATUS COLOR =================
const getStatusColor = (status) => {
    switch (status) {
        case 'Trong kho': return 'bg-green-100 text-green-600';
        case 'Đã đặt cọc': return 'bg-yellow-100 text-yellow-600';
        case 'Đã bán': return 'bg-gray-200 text-gray-600';
        case 'Đang bảo trì': return 'bg-blue-100 text-blue-600';
        default: return 'bg-gray-100 text-gray-500';
    }
};

// ================= CARD =================
const InventoryCard = ({ unit, onEdit }) => {

    const colorHex = getColorHex(unit.color?.name);

    const image = unit.image || 'https://via.placeholder.com/150';

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-5 flex gap-5 items-center hover:shadow-xl transition">

            {/* IMAGE */}
            <div className="w-36 h-24 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={image} className="h-full object-contain" alt="car" />
            </div>

            {/* INFO */}
            <div className="flex-grow">
                <h3 className="font-black text-blue-900 uppercase italic">
                    {unit.modelName} {unit.variantName}
                </h3>

                <div className="text-xs mt-2 space-y-1 text-gray-600">
                    <div><b>VIN:</b> {unit.vin}</div>

                    <div className="flex items-center gap-2">
                        <b>Màu:</b>
                        <span
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorHex }}
                        />
                        {unit.color?.name || 'Không rõ'}
                    </div>

                    <div>
                        <b>Giá nhập:</b>
                        <span className="text-blue-900 font-bold ml-1">
                            {unit.importPrice?.toLocaleString()} VNĐ
                        </span>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full ${getStatusColor(unit.status)}`}>
                        {unit.status}
                    </span>

                    {unit.category === 'Demo' && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold">
                            Xe lái thử
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={() => onEdit(unit)}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg text-xs font-bold"
            >
                Sửa
            </button>
        </div>
    );
};

// ================= MAIN =================
const VehicleInventory = () => {

    const [units, setUnits] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Tất cả');

    const [color, setColor] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState('');

    const [colors, setColors] = useState([]); // colors theo variant

    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // ================= INVENTORY =================
    const fetchInventory = async () => {
        try {
            const res = await api.get('/vehicles/inventory');
            setUnits(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ================= COLORS BY VARIANT (FIX 404) =================
    const fetchColorsByVariant = async (variantId) => {
        try {
            const res = await api.get(`/vehicles/colors/variant/${variantId}`);
            setColors(res.data.data);
        } catch (err) {
            console.error("Load colors error:", err);
            setColors([]);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // ================= FILTER =================
    const filtered = useMemo(() => {
        return units.filter(u => {

            if (status !== 'Tất cả' && u.status !== status) return false;

            if (search &&
                !(
                    u.vin?.toLowerCase().includes(search.toLowerCase()) ||
                    u.variantName?.toLowerCase().includes(search.toLowerCase()) ||
                    u.modelName?.toLowerCase().includes(search.toLowerCase())
                )
            ) return false;

            if (color && u.color?.name !== color) return false;
            if (category && u.category !== category) return false;

            if (priceRange) {
                if (priceRange === '<1' && u.importPrice >= 1_000_000_000) return false;
                if (priceRange === '1-2' && (u.importPrice < 1_000_000_000 || u.importPrice > 2_000_000_000)) return false;
                if (priceRange === '>2' && u.importPrice <= 2_000_000_000) return false;
            }

            return true;
        });
    }, [units, search, status, color, category, priceRange]);

    // ================= SAVE =================
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            await api.patch(`/vehicles/inventory/${editing._id}`, {
                importPrice: editing.importPrice,
                status: editing.status,
                colorId: editing.colorId
            });

            setOpenModal(false);
            fetchInventory();

        } catch (err) {
            console.error(err);
            alert("Lỗi cập nhật");
        }
    };

    if (loading) {
        return <div className="p-10 text-center font-bold">Đang tải kho xe...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* FILTER */}
            <div className="flex gap-3 flex-wrap mb-6">

                <input
                    placeholder="Tìm VIN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 rounded-xl"
                />

                <select onChange={(e) => setColor(e.target.value)} className="border p-2 rounded-xl">
                    <option value="">Màu</option>
                    {colors.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                </select>

                <select onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded-xl">
                    <option value="">Loại xe</option>
                    <option value="Commercial">Kinh doanh</option>
                    <option value="Demo">Lái thử</option>
                </select>

                <select onChange={(e) => setPriceRange(e.target.value)} className="border p-2 rounded-xl">
                    <option value="">Giá</option>
                    <option value="<1">Dưới 1 tỷ</option>
                    <option value="1-2">1 - 2 tỷ</option>
                    <option value=">2">Trên 2 tỷ</option>
                </select>
            </div>

            {/* LIST */}
            <div className="space-y-4">
                {filtered.map(unit => (
                    <InventoryCard
                        key={unit._id}
                        unit={unit}
                        onEdit={(u) => {
                            setEditing({
                                ...u,
                                colorId: u.color?._id || '',
                                status: u.status
                            });

                            setOpenModal(true);

                            if (u.variantId?._id) {
                                fetchColorsByVariant(u.variantId._id);
                            }
                        }}
                    />
                ))}
            </div>

            {/* MODAL */}
            {openModal && editing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-2xl w-[400px]">

                        <form onSubmit={handleSave} className="space-y-3">

                            {/* COLOR */}
                            <select
                                value={editing.colorId}
                                onChange={(e) =>
                                    setEditing({ ...editing, colorId: e.target.value })
                                }
                                className="w-full border p-2 rounded"
                            >
                                {colors.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                            {/* PRICE */}
                            <input
                                type="number"
                                value={editing.importPrice}
                                onChange={(e) =>
                                    setEditing({ ...editing, importPrice: Number(e.target.value) })
                                }
                                className="w-full border p-2 rounded"
                            />

                            <button className="w-full bg-blue-900 text-white py-2 rounded">
                                Lưu
                            </button>

                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleInventory;