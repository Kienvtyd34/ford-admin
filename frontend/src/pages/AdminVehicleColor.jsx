import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const AdminVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= STATE QUẢN LÝ DÒNG XE =================
  const [isEditingModel, setIsEditingModel] = useState(false);

  const [modelForm, setModelForm] = useState({
    name: '',
    type: 'SUV',
    seats: 5,
    specs: {
      engine: '',
      fuelType: '',
      wheel: ''
    },
    description: '',
    isHot: false
  });

  const [mainImage, setMainImage] = useState(null);

  // ================= STATE QUẢN LÝ MÀU SẮC =================
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [colors, setColors] = useState([]);

  const [editingColor, setEditingColor] = useState(null);

  const [colorForm, setColorForm] = useState({
    name: '',
    hexCode: ''
  });

  const [colorImages, setColorImages] = useState([]);

  // ================= FETCH VEHICLES =================
  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách xe:', err);
    }
  };

  // ================= FETCH COLORS =================
  const fetchColors = async (variantId) => {
    if (!variantId) return;

    try {
      const res = await api.get(`/vehicles/colors/variant/${variantId}`);
      setColors(res.data.data || []);
    } catch (err) {
      console.error('Lỗi lấy màu:', err);
      setColors([]);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ================= EDIT MODEL =================
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

  // ================= UPDATE MODEL =================
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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Cập nhật dòng xe thành công!');

      setIsEditingModel(false);
      setMainImage(null);

      fetchVehicles();
    } catch (err) {
      console.error(err);

      alert(
        'Lỗi khi cập nhật dòng xe: ' +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE VEHICLE =================
  const handleDeleteVehicle = async (id) => {
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn xóa dòng xe này? Lưu ý: Không thể xóa nếu còn phiên bản đang tồn tại.'
      )
    )
      return;

    try {
      await api.delete(`/vehicles/${id}`);

      alert('Xóa thành công!');

      fetchVehicles();
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // ================= ADD COLOR =================
  const handleAddColor = async () => {
    try {
      if (!selectedVariant)
        return alert('Vui lòng chọn phiên bản trước!');

      if (!colorForm.name || !colorForm.hexCode)
        return alert('Vui lòng điền đủ tên màu và mã màu!');

      setLoading(true);

      const formData = new FormData();

      formData.append('variantId', selectedVariant._id);
      formData.append('name', colorForm.name);
      formData.append('hexCode', colorForm.hexCode);

      colorImages.forEach((img) => formData.append('images', img));

      await api.post('/vehicles/colors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Thêm màu thành công');

      setColorForm({
        name: '',
        hexCode: ''
      });

      setColorImages([]);

      fetchColors(selectedVariant._id);
    } catch (err) {
      console.error(err);
      alert('Lỗi thêm màu');
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE COLOR =================
  const handleDeleteColor = async (id) => {
    if (!window.confirm('Xóa màu này?')) return;

    try {
      await api.delete(`/vehicles/colors/${id}`);

      fetchColors(selectedVariant._id);
    } catch (err) {
      alert('Lỗi xóa màu');
    }
  };

  // ================= UPDATE COLOR =================
  const handleUpdateColor = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', colorForm.name);
      formData.append('hexCode', colorForm.hexCode);

      if (colorImages.length > 0) {
        colorImages.forEach((img) =>
          formData.append('images', img)
        );
      }

      await api.patch(
        `/vehicles/colors/${editingColor._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Cập nhật thành công');

      setEditingColor(null);

      setColorForm({
        name: '',
        hexCode: ''
      });

      setColorImages([]);

      fetchColors(selectedVariant._id);
    } catch (err) {
      alert('Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen font-sans">
      {/* ================= HEADER ================= */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">
            Quản lý dòng xe Ford
          </h2>

          <button className="bg-blue-800 text-white px-5 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-900 transition-all">
            + THÊM XE MỚI
          </button>
        </div>

        {/* ================= VEHICLE LIST ================= */}
        <div className="space-y-5">
          {vehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* IMAGE */}
                <div className="w-full md:w-1/4 flex flex-col items-center justify-center">
                  <img
                    src={
                      v.imageUrl ||
                      'https://via.placeholder.com/300x200'
                    }
                    alt={v.name}
                    className="w-full h-44 object-contain"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-blue-900 uppercase italic">
                      {v.name}
                    </h3>

                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tight">
                      {v.type}
                    </span>

                    {v.isHot && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                        Hot Sale
                      </span>
                    )}
                  </div>

                  {/* SPECS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-gray-500 uppercase">
                    <div className="flex items-center gap-2">
                      ⚙️ {v.specs?.engine || 'N/A'}
                    </div>

                    <div className="flex items-center gap-2">
                      ⛽ {v.specs?.fuelType || 'N/A'}
                    </div>

                    <div className="flex items-center gap-2">
                      💺 {v.seats || '0'} Chỗ
                    </div>

                    <div className="flex items-center gap-2">
                      🛞 {v.specs?.wheel || 'N/A'}
                    </div>
                  </div>

                  {/* VARIANTS */}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Các phiên bản hiện có:
                    </p>

                    {v.variants && v.variants.length > 0 ? (
                      v.variants.map((variant) => (
                        <div
                          key={variant._id}
                          className="flex justify-between items-center py-1 bg-gray-50/50 px-3 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {variant.variantName}
                          </span>

                          <span className="text-blue-900 font-black">
                            {(
                              variant.basePrice ||
                              variant.price ||
                              0
                            ).toLocaleString()}{' '}
                            VNĐ
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-xs italic">
                        Chưa có phiên bản & giá
                      </p>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
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

      {/* ================= EDIT MODAL ================= */}
      {isEditingModel && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-2xl font-black text-blue-900 uppercase">
                Chỉnh sửa: {selectedModel?.name}
              </h3>

              <button
                onClick={() => setIsEditingModel(false)}
                className="text-gray-400 hover:text-red-500 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleUpdateModel}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Tên dòng xe
                    </label>

                    <input
                      type="text"
                      className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                      value={modelForm.name}
                      onChange={(e) =>
                        setModelForm({
                          ...modelForm,
                          name: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        Loại xe
                      </label>

                      <select
                        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                        value={modelForm.type}
                        onChange={(e) =>
                          setModelForm({
                            ...modelForm,
                            type: e.target.value
                          })
                        }
                      >
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Pick-up">Pick-up</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        Số chỗ ngồi
                      </label>

                      <input
                        type="number"
                        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                        value={modelForm.seats}
                        onChange={(e) =>
                          setModelForm({
                            ...modelForm,
                            seats: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Thay đổi ảnh đại diện
                    </label>

                    <input
                      type="file"
                      className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm"
                      onChange={(e) =>
                        setMainImage(e.target.files[0])
                      }
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer"
                      checked={modelForm.isHot}
                      onChange={(e) =>
                        setModelForm({
                          ...modelForm,
                          isHot: e.target.checked
                        })
                      }
                    />

                    <label className="font-bold text-gray-700 cursor-pointer">
                      Đánh dấu dòng xe HOT
                    </label>
                  </div>

                  {/* SPECS */}
                  <div className="space-y-3">
                    <input
                      placeholder="Động cơ"
                      className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                      value={modelForm.specs.engine}
                      onChange={(e) =>
                        setModelForm({
                          ...modelForm,
                          specs: {
                            ...modelForm.specs,
                            engine: e.target.value
                          }
                        })
                      }
                    />

                    <input
                      placeholder="Loại nhiên liệu"
                      className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                      value={modelForm.specs.fuelType}
                      onChange={(e) =>
                        setModelForm({
                          ...modelForm,
                          specs: {
                            ...modelForm.specs,
                            fuelType: e.target.value
                          }
                        })
                      }
                    />

                    <input
                      placeholder="Thông số mâm/vỏ"
                      className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none"
                      value={modelForm.specs.wheel}
                      onChange={(e) =>
                        setModelForm({
                          ...modelForm,
                          specs: {
                            ...modelForm.specs,
                            wheel: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-5">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Mô tả chi tiết
                  </label>

                  <Editor
                    apiKey="gv0dobysumfihba6i2rhdg3v79x9bvpa2e33l13gmng5f0qv"
                    value={modelForm.description}
                    onEditorChange={(content) =>
                      setModelForm({
                        ...modelForm,
                        description: content
                      })
                    }
                    init={{
                      height: 500,
                      menubar: 'insert table view format',
                      plugins:
                        'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
                      toolbar:
                        'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist | image table | removeformat',
                      automatic_uploads: true,

                      images_upload_handler: async (
                        blobInfo
                      ) => {
                        try {
                          const uploadFormData =
                            new FormData();

                          uploadFormData.append(
                            'file',
                            blobInfo.blob(),
                            blobInfo.filename()
                          );

                          const userInfo = JSON.parse(
                            localStorage.getItem('userInfo')
                          );

                          const res = await axios.post(
                            'https://ford-admin.onrender.com/api/vehicles/upload-editor',
                            uploadFormData,
                            {
                              headers: {
                                'Content-Type':
                                  'multipart/form-data',
                                Authorization: `Bearer ${userInfo?.token}`
                              }
                            }
                          );

                          return res.data.location;
                        } catch (err) {
                          console.error(err);

                          throw new Error(
                            'Upload ảnh thất bại'
                          );
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingModel(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  HỦY BỎ
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-3 bg-blue-900 text-white font-bold rounded-xl shadow-xl hover:bg-blue-950 disabled:bg-gray-400 transition-all"
                >
                  {loading
                    ? 'ĐANG LƯU...'
                    : 'CẬP NHẬT DÒNG XE'}
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