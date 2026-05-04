import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ================= STATE QUẢN LÝ DÒNG XE (VEHICLE MODEL) =================
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [modelForm, setModelForm] = useState({
    name: '', 
    type: 'SUV', 
    seats: 5, 
    specs: { engine: '', fuelType: '', wheel: '' }, 
    description: '', 
    isHot: false
  });
  const [mainImage, setMainImage] = useState(null);

  // ================= STATE QUẢN LÝ MÀU SẮC (COLORS) =================
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [colors, setColors] = useState([]);
  const [editingColor, setEditingColor] = useState(null);
  const [colorForm, setColorForm] = useState({
    name: '',
    hexCode: ''
  });
  const [colorImages, setColorImages] = useState([]);

  // ================= FETCH DATA =================
  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách xe:", err);
    }
  };

  const fetchColors = async (variantId) => {
    if (!variantId) return;
    try {
      const res = await api.get(`/vehicles/colors/variant/${variantId}`);
      setColors(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy màu:", err);
      setColors([]);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ================= LOGIC QUẢN LÝ DÒNG XE =================
  const handleEditModel = (model) => {
    setSelectedModel(model);
    setModelForm({
      name: model.name || '',
      type: model.type || 'SUV',
      seats: model.seats || 5,
      specs: { 
        engine: model.specs?.engine || '', 
        fuelType: model.specs?.fuelType || '', 
        wheel: model.specs?.wheel || '' 
      },
      description: model.description || '',
      isHot: model.isHot || false
    });
    setIsEditingModel(true);
  };

  const handleUpdateModel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', modelForm.name);
      formData.append('type', modelForm.type);
      formData.append('seats', modelForm.seats);
      formData.append('description', modelForm.description);
      formData.append('specs', JSON.stringify(modelForm.specs));
      formData.append('isHot', modelForm.isHot);
      
      if (mainImage) {
        formData.append('image', mainImage);
      }

      await api.patch(`/vehicles/${selectedModel._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Cập nhật dòng xe thành công!");
      setIsEditingModel(false);
      setMainImage(null);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật dòng xe: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dòng xe này? Lưu ý: Không thể xóa nếu còn phiên bản đang tồn tại.")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      alert("Xóa thành công!");
      fetchVehicles();
    } catch (err) {
      alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= LOGIC QUẢN LÝ MÀU SẮC =================
  const handleAddColor = async () => {
    try {
      if (!selectedVariant) return alert("Vui lòng chọn phiên bản trước!");
      if (!colorForm.name || !colorForm.hexCode) return alert("Vui lòng điền đủ tên màu và mã màu!");
      setLoading(true);

      const formData = new FormData();
      formData.append('variantId', selectedVariant._id); 
      formData.append('name', colorForm.name);
      formData.append('hexCode', colorForm.hexCode);
      colorImages.forEach(img => formData.append('images', img));

      await api.post('/vehicles/colors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Thêm màu thành công");
      setColorForm({ name: '', hexCode: '' });
      setColorImages([]);
      fetchColors(selectedVariant._id);
    } catch (err) {
      console.error(err);
      alert("Lỗi thêm màu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColor = async (id) => {
    if (!window.confirm("Xóa màu này?")) return;
    try {
      await api.delete(`/vehicles/colors/${id}`);
      fetchColors(selectedVariant._id);
    } catch (err) {
      alert("Lỗi xóa màu");
    }
  };

  const handleUpdateColor = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', colorForm.name);
      formData.append('hexCode', colorForm.hexCode);
      if (colorImages.length > 0) {
        colorImages.forEach(img => formData.append('images', img));
      }

      await api.patch(`/vehicles/colors/${editingColor._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Cập nhật thành công");
      setEditingColor(null);
      setColorForm({ name: '', hexCode: '' });
      setColorImages([]);
      fetchColors(selectedVariant._id);
    } catch (err) {
      alert("Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen font-sans">
      
      {/* ---------------- SECTION 1: QUẢN LÝ DÒNG XE (CARDS) ---------------- */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">Quản lý dòng xe Ford</h2>
          <button className="bg-blue-800 text-white px-5 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-900 transition-all">
            + THÊM XE MỚI
          </button>
        </div>

        <div className="space-y-5">
          {vehicles.map(v => (
            <div key={v._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Ảnh đại diện */}
                <div className="w-full md:w-1/4 flex flex-col items-center justify-center">
                  <img src={v.imageUrl || 'https://via.placeholder.com/300x200'} alt={v.name} className="w-full h-44 object-contain" />
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-blue-900 uppercase italic">{v.name}</h3>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tight">
                      {v.type}
                    </span>
                    {v.isHot && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                        Hot Sale
                      </span>
                    )}
                  </div>

                  {/* Thông số kỹ thuật */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-gray-500 uppercase">
                    <div className="flex items-center gap-2">⚙️ {v.specs?.engine || 'N/A'}</div>
                    <div className="flex items-center gap-2">⛽ {v.specs?.fuelType || 'N/A'}</div>
                    <div className="flex items-center gap-2">💺 {v.seats || '0'} Chỗ</div>
                    <div className="flex items-center gap-2">🛞 {v.specs?.wheel || 'N/A'}</div>
                  </div>

                  {/* Giá các phiên bản */}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Các phiên bản hiện có:</p>
                    {v.variants && v.variants.length > 0 ? (
                      v.variants.map(variant => (
                        <div key={variant._id} className="flex justify-between items-center py-1 bg-gray-50/50 px-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">
                            {variant.variantName}
                          </span>
                          <span className="text-blue-900 font-black">
                            {(variant.basePrice || variant.price || 0).toLocaleString()} VNĐ
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-xs italic">Chưa có phiên bản & giá</p>
                    )}
                  </div>
                </div>

                {/* Nút tác vụ */}
                <div className="flex flex-col gap-3 justify-center min-w-[120px]">
                  <button 
                    onClick={() => handleEditModel(v)}
                    className="w-full bg-blue-50 text-blue-700 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                  >
                    SỬA
                  </button>
                  <button 
                    onClick={() => handleDeleteVehicle(v._id)}
                    className="w-full bg-white border border-red-100 text-red-500 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors"
                  >
                    XÓA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* ---------------- SECTION 2: QUẢN LÝ MÀU SẮC THEO PHIÊN BẢN ---------------- */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Quản lý Màu sắc theo Phiên bản</h2>

        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Bước 1: Chọn dòng xe</label>
            <select
              value={selectedModel?._id || ""}
              onChange={(e) => {
                const model = vehicles.find(v => v._id === e.target.value);
                setSelectedModel(model);
                setSelectedVariant(null);
                setColors([]);
              }}
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
            >
              <option value="">-- Chọn xe --</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Bước 2: Chọn phiên bản</label>
            <select
              disabled={!selectedModel}
              value={selectedVariant?._id || ""}
              onChange={(e) => {
                const variant = selectedModel.variants.find(v => v._id === e.target.value);
                setSelectedVariant(variant);
                fetchColors(e.target.value);
              }}
              className="w-full border-2 border-gray-100 p-3 rounded-xl disabled:bg-gray-50 outline-none transition-all"
            >
              <option value="">-- Chọn phiên bản --</option>
              {selectedModel?.variants?.map(v => (
                <option key={v._id} value={v._id}>{v.variantName}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedVariant && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-xl text-blue-700 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-700 rounded-full"></span>
              Bảng màu: {selectedModel.name} - {selectedVariant.variantName}
            </h3>

            {/* Form Thêm/Sửa Màu */}
            <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 p-8 rounded-3xl">
              <h4 className="font-bold mb-5 text-blue-900">{editingColor ? "Đang chỉnh sửa màu" : "Thêm màu mới cho phiên bản này"}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <input
                  placeholder="Tên màu (VD: Đỏ Crystal)"
                  value={colorForm.name}
                  onChange={e => setColorForm({ ...colorForm, name: e.target.value })}
                  className="p-3 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  placeholder="Mã màu HEX (VD: #FF0000)"
                  value={colorForm.hexCode}
                  onChange={e => setColorForm({ ...colorForm, hexCode: e.target.value })}
                  className="p-3 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex flex-col gap-1">
                    <input
                    type="file"
                    multiple
                    onChange={e => setColorImages([...e.target.files])}
                    className="p-2 rounded-xl bg-white border border-blue-100 text-sm"
                    />
                    <p className="text-[10px] text-blue-400 italic">* Bạn có thể chọn nhiều ảnh cùng lúc</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  disabled={loading}
                  onClick={editingColor ? handleUpdateColor : handleAddColor}
                  className={`px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${
                    loading ? "bg-gray-400" : editingColor ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  {loading ? "Đang xử lý..." : editingColor ? "CẬP NHẬT MÀU" : "LƯU MÀU XE"}
                </button>
                {editingColor && (
                  <button onClick={() => { setEditingColor(null); setColorForm({name:'', hexCode:''}); setColorImages([]); }} className="px-6 py-3 bg-gray-400 text-white rounded-xl">HỦY</button>
                )}
              </div>
            </div>

            {/* Danh sách màu hiện tại */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {colors.length === 0 && <p className="text-gray-400 italic col-span-full text-center py-10">Phiên bản này chưa có thông tin màu sắc.</p>}
              {colors.map(c => (
                <div key={c._id} className="bg-white border rounded-2xl p-4 shadow-sm relative group border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-gray-200 shadow-inner" style={{ background: c.hexCode }}></div>
                      <span className="font-bold text-sm text-gray-700">{c.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingColor(c); setColorForm({ name: c.name, hexCode: c.hexCode }); }} className="text-blue-500 hover:scale-125 transition-transform text-sm">✏️</button>
                      <button onClick={() => handleDeleteColor(c._id)} className="text-red-500 hover:scale-125 transition-transform text-sm">❌</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {c.images && c.images.length > 0 ? (
                        c.images.map((img, i) => (
                            <img key={i} src={img} className="w-full h-24 object-cover rounded-xl border border-gray-50 shadow-sm" alt="ford-color" />
                        ))
                    ) : (
                        <div className="col-span-2 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-[10px] text-gray-400">Không có ảnh</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------------- MODAL CHỈNH SỬA DÒNG XE ---------------- */}
      {isEditingModel && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-2xl font-black text-blue-900 uppercase">Chỉnh sửa: {selectedModel?.name}</h3>
              <button onClick={() => setIsEditingModel(false)} className="text-gray-400 hover:text-red-500 text-2xl transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleUpdateModel} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tên dòng xe</label>
                  <input type="text" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" value={modelForm.name} onChange={e => setModelForm({...modelForm, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Loại xe</label>
                    <select className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" value={modelForm.type} onChange={e => setModelForm({...modelForm, type: e.target.value})}>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Pick-up">Pick-up</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Số chỗ ngồi</label>
                    <input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" value={modelForm.seats} onChange={e => setModelForm({...modelForm, seats: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Thay đổi ảnh đại diện (Nếu cần)</label>
                  <input type="file" className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm" onChange={e => setMainImage(e.target.files[0])} />
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" className="w-5 h-5 cursor-pointer" id="isHot" checked={modelForm.isHot} onChange={e => setModelForm({...modelForm, isHot: e.target.checked})} />
                  <label htmlFor="isHot" className="font-bold text-gray-700 cursor-pointer">Đánh dấu dòng xe HOT</label>
                </div>
              </div>

              <div className="space-y-5">
                <p className="font-black text-gray-800 uppercase tracking-widest text-xs border-b pb-2">Thông số kỹ thuật & Mô tả</p>
                <div className="space-y-3">
                  <input placeholder="Động cơ (VD: 2.0L Bi-Turbo)" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" value={modelForm.specs.engine} onChange={e => setModelForm({...modelForm, specs: {...modelForm.specs, engine: e.target.value}})} />
                  <input placeholder="Loại nhiên liệu (VD: Dầu Diesel)" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" value={modelForm.specs.fuelType} onChange={e => setModelForm({...modelForm, specs: {...modelForm.specs, fuelType: e.target.value}})} />
                  <input placeholder="Thông số mâm/vỏ (VD: 20-inch hợp kim)" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" value={modelForm.specs.wheel} onChange={e => setModelForm({...modelForm, specs: {...modelForm.specs, wheel: e.target.value}})} />
                </div>
                <textarea 
                  placeholder="Mô tả chi tiết về xe..." 
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl h-36 outline-none focus:border-blue-500"
                  value={modelForm.description}
                  onChange={e => setModelForm({...modelForm, description: e.target.value})}
                ></textarea>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsEditingModel(false)} className="px-8 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors">HỦY BỎ</button>
                <button type="submit" disabled={loading} className="px-12 py-3 bg-blue-900 text-white font-bold rounded-xl shadow-xl hover:bg-blue-950 disabled:bg-gray-400 transition-all">
                  {loading ? "ĐANG LƯU..." : "CẬP NHẬT DÒNG XE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicle;