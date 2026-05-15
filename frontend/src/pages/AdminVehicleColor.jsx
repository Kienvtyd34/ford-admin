import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Editor } from '@tinymce/tinymce-react';

const FALLBACK_IMG =
  'https://dummyimage.com/600x400/e5e7eb/6b7280&text=No+Image';

const AdminVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= MODEL =================
  const [isEditingModel, setIsEditingModel] = useState(false);

  const [modelForm, setModelForm] = useState({
    name: '',
    type: 'SUV',
    seats: 5,
    description: '',
    isHot: false
  });

  const [mainImage, setMainImage] = useState(null);
  const [specImage, setSpecImage] = useState(null);

  // ================= COLOR =================
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [colors, setColors] = useState([]);

  const [editingColor, setEditingColor] = useState(null);

  const [colorForm, setColorForm] = useState({
    name: '',
    hexCode: ''
  });

  const [colorImages, setColorImages] = useState([]);

  // ================= GET VEHICLE IMAGE =================
  const getVehicleImage = (vehicle) => {
    return (
      vehicle?.images?.[0] ||
      vehicle?.thumbnail ||
      FALLBACK_IMG
    );
  };

  // ================= FETCH VEHICLES =================
  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');

      setVehicles(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH COLORS =================
  const fetchColors = async (variantId) => {
    try {
      const res = await api.get(
        `/vehicles/colors/variant/${variantId}`
      );

      setColors(res.data.data || []);
    } catch (err) {
      console.error(err);

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
      description: model.description || '',
      isHot: model.isHot || false
    });

    setIsEditingModel(true);
  };

  // ================= UPDATE MODEL =================
  const handleUpdateModel = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', modelForm.name);
      formData.append('type', modelForm.type);
      formData.append('seats', modelForm.seats);

      formData.append(
        'description',
        modelForm.description
      );

      formData.append(
        'isHot',
        modelForm.isHot
      );

      // ================= ẢNH ĐẠI DIỆN =================
      if (mainImage) {
        formData.append(
          'images',
          mainImage
        );
      }

      // ================= ẢNH THÔNG SỐ =================
      // ================= ẢNH THÔNG SỐ =================
      if (specImage) {
        formData.append(
          'imageUrl',
          specImage
        );
      }

      await api.patch(
        `/vehicles/${selectedModel._id}`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      );

      alert('Cập nhật thành công');

      setIsEditingModel(false);

      setMainImage(null);
      setSpecImage(null);

      fetchVehicles();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.error ||
          'Lỗi cập nhật'
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE VEHICLE =================
  const handleDeleteVehicle = async (id) => {
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn xóa dòng xe?'
      )
    )
      return;

    try {
      await api.delete(`/vehicles/${id}`);

      alert('Xóa thành công');

      fetchVehicles();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          'Lỗi xóa'
      );
    }
  };

  // ================= ADD COLOR =================
  const handleAddColor = async () => {
    try {
      if (!selectedVariant) {
        return alert(
          'Vui lòng chọn phiên bản'
        );
      }

      const formData = new FormData();

      formData.append(
        'variantId',
        selectedVariant._id
      );

      formData.append(
        'name',
        colorForm.name
      );

      formData.append(
        'hexCode',
        colorForm.hexCode
      );

      colorImages.forEach((img) => {
        formData.append('images', img);
      });

      await api.post(
        '/vehicles/colors',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      );

      alert('Thêm màu thành công');

      setColorForm({
        name: '',
        hexCode: ''
      });

      setColorImages([]);

      fetchColors(selectedVariant._id);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.error ||
          'Lỗi thêm màu'
      );
    }
  };

  // ================= UPDATE COLOR =================
  const handleUpdateColor = async () => {
    try {
      const formData = new FormData();

      formData.append(
        'name',
        colorForm.name
      );

      formData.append(
        'hexCode',
        colorForm.hexCode
      );

      colorImages.forEach((img) => {
        formData.append('images', img);
      });

      await api.patch(
        `/vehicles/colors/${editingColor._id}`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      );

      alert('Cập nhật màu thành công');

      setEditingColor(null);

      setColorForm({
        name: '',
        hexCode: ''
      });

      setColorImages([]);

      fetchColors(selectedVariant._id);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.error ||
          'Lỗi cập nhật màu'
      );
    }
  };

  // ================= DELETE COLOR =================
  const handleDeleteColor = async (id) => {
    if (!window.confirm('Xóa màu này?'))
      return;

    try {
      await api.delete(
        `/vehicles/colors/${id}`
      );

      fetchColors(selectedVariant._id);
    } catch (err) {
      console.error(err);

      alert('Lỗi xóa màu');
    }
  };

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">

        <h2 className="text-3xl font-black text-blue-900">
          QUẢN LÝ DÒNG XE FORD
        </h2>

        <button className="bg-blue-900 text-white px-5 py-3 rounded-xl font-bold">
          + THÊM XE
        </button>

      </div>

      {/* ================= VEHICLE LIST ================= */}
      <div className="space-y-6">

        {vehicles.map((v) => (
          <div
            key={v._id}
            className="bg-white rounded-3xl p-6 shadow"
          >

            <div className="flex flex-col md:flex-row gap-8">

              {/* IMAGE */}
              <div className="w-full md:w-1/4">

                <img
                  src={getVehicleImage(v)}
                  alt={v.name}
                  onError={(e) => {
                    e.target.src =
                      FALLBACK_IMG;
                  }}
                  className="w-full h-52 object-contain rounded-2xl bg-white"
                />

              </div>

              {/* INFO */}
              <div className="flex-1 space-y-5">

                <div className="flex items-center gap-3">

                  <h3 className="text-3xl font-black text-blue-900 italic uppercase">
                    {v.name}
                  </h3>

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                    {v.type}
                  </span>

                  {v.isHot && (
                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                      HOT
                    </span>
                  )}

                </div>

                <div className="grid grid-cols-2 gap-4 text-sm font-bold text-gray-500">

                  <div>
                    💺 {v.seats} chỗ
                  </div>

                  <div>
                    🚘 Ford
                  </div>

                </div>

                {/* ================= VARIANTS ================= */}
                <div className="border-t pt-5 space-y-4">

                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Các phiên bản
                  </p>

                  {v.variants &&
                  v.variants.length > 0 ? (
                    v.variants.map(
                      (variant) => (
                        <div
                          key={variant._id}
                          className="border rounded-2xl p-4 bg-gray-50"
                        >

                          {/* HEADER */}
                          <div className="flex justify-between items-center">

                            <div>

                              <h4 className="font-bold text-lg text-gray-700">
                                {
                                  variant.variantName
                                }
                              </h4>

                              <p className="text-blue-900 font-black">
                                {(
                                  variant.basePrice ||
                                  variant.price ||
                                  0
                                ).toLocaleString()}{' '}
                                VNĐ
                              </p>

                            </div>

                            <button
                              onClick={() => {
                                setSelectedVariant(
                                  variant
                                );

                                fetchColors(
                                  variant._id
                                );
                              }}
                              className="bg-blue-700 text-white px-4 py-2 rounded-xl font-bold"
                            >
                              Quản lý màu
                            </button>

                          </div>

                          {/* ================= COLOR PANEL ================= */}
                          {selectedVariant?._id ===
                            variant._id && (
                            <div className="mt-5 space-y-5">

                              {/* FORM */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

                                <input
                                  type="text"
                                  placeholder="Tên màu"
                                  value={
                                    colorForm.name
                                  }
                                  onChange={(e) =>
                                    setColorForm({
                                      ...colorForm,
                                      name:
                                        e.target
                                          .value
                                    })
                                  }
                                  className="border p-3 rounded-xl"
                                />

                                <input
                                  type="text"
                                  placeholder="#ffffff"
                                  value={
                                    colorForm.hexCode
                                  }
                                  onChange={(e) =>
                                    setColorForm({
                                      ...colorForm,
                                      hexCode:
                                        e.target
                                          .value
                                    })
                                  }
                                  className="border p-3 rounded-xl"
                                />

                                <input
                                  type="file"
                                  multiple
                                  onChange={(e) =>
                                    setColorImages(
                                      Array.from(
                                        e.target
                                          .files
                                      )
                                    )
                                  }
                                  className="border p-3 rounded-xl"
                                />

                                <button
                                  onClick={
                                    editingColor
                                      ? handleUpdateColor
                                      : handleAddColor
                                  }
                                  className="bg-green-600 text-white rounded-xl font-bold"
                                >
                                  {editingColor
                                    ? 'Cập nhật màu'
                                    : 'Thêm màu'}
                                </button>

                              </div>

                              {/* COLOR LIST */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {colors.map(
                                  (color) => (
                                    <div
                                      key={
                                        color._id
                                      }
                                      className="border rounded-2xl p-4 bg-white"
                                    >

                                      <div className="flex justify-between items-center">

                                        <div className="flex items-center gap-3">

                                          <div
                                            className="w-10 h-10 rounded-full border"
                                            style={{
                                              background:
                                                color.hexCode
                                            }}
                                          />

                                          <div>

                                            <p className="font-bold">
                                              {
                                                color.name
                                              }
                                            </p>

                                            <p className="text-xs text-gray-500">
                                              {
                                                color.hexCode
                                              }
                                            </p>

                                          </div>

                                        </div>

                                        <div className="flex gap-2">

                                          <button
                                            onClick={() => {
                                              setEditingColor(
                                                color
                                              );

                                              setColorForm(
                                                {
                                                  name:
                                                    color.name,
                                                  hexCode:
                                                    color.hexCode
                                                }
                                              );
                                            }}
                                            className="bg-yellow-400 px-3 py-1 rounded-lg text-sm font-bold"
                                          >
                                            Sửa
                                          </button>

                                          <button
                                            onClick={() =>
                                              handleDeleteColor(
                                                color._id
                                              )
                                            }
                                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold"
                                          >
                                            Xóa
                                          </button>

                                        </div>

                                      </div>

                                      {/* IMAGES */}
                                      {color.images
                                        ?.length >
                                        0 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto">

                                          {color.images.map(
                                            (
                                              img,
                                              index
                                            ) => (
                                              <img
                                                key={
                                                  index
                                                }
                                                src={
                                                  img ||
                                                  FALLBACK_IMG
                                                }
                                                alt={
                                                  color.name
                                                }
                                                onError={(
                                                  e
                                                ) => {
                                                  e.target.src =
                                                    FALLBACK_IMG;
                                                }}
                                                className="w-28 h-20 object-cover rounded-xl border bg-white"
                                              />
                                            )
                                          )}

                                        </div>
                                      )}

                                    </div>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      Chưa có phiên bản
                    </p>
                  )}

                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-3 justify-center min-w-[130px]">

                <button
                  onClick={() =>
                    handleEditModel(v)
                  }
                  className="bg-blue-50 text-blue-700 py-3 rounded-xl font-bold"
                >
                  SỬA
                </button>

                <button
                  onClick={() =>
                    handleDeleteVehicle(v._id)
                  }
                  className="bg-red-50 text-red-600 py-3 rounded-xl font-bold"
                >
                  XÓA
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* ================= EDIT MODAL ================= */}
      {isEditingModel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5">

          <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto p-10">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">

              <h3 className="text-3xl font-black text-blue-900">
                Chỉnh sửa:{' '}
                {selectedModel?.name}
              </h3>

              <button
                onClick={() =>
                  setIsEditingModel(false)
                }
                className="text-3xl text-gray-400 hover:text-red-500"
              >
                ✕
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleUpdateModel}
              className="space-y-8"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* LEFT */}
                <div className="space-y-5">

                  <input
                    type="text"
                    placeholder="Tên xe"
                    value={modelForm.name}
                    onChange={(e) =>
                      setModelForm({
                        ...modelForm,
                        name:
                          e.target.value
                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                  <select
                    value={modelForm.type}
                    onChange={(e) =>
                      setModelForm({
                        ...modelForm,
                        type:
                          e.target.value
                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  >
                    <option value="SUV">
                      SUV
                    </option>

                    <option value="Sedan">
                      Sedan
                    </option>

                    <option value="Pick-up">
                      Pick-up
                    </option>

                    <option value="Van">
                      Van
                    </option>
                  </select>

                  <input
                    type="number"
                    value={modelForm.seats}
                    onChange={(e) =>
                      setModelForm({
                        ...modelForm,
                        seats:
                          e.target.value
                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                  <div>

                    <label className="font-bold text-sm text-gray-500">
                      Ảnh đại diện xe
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setMainImage(
                          e.target.files[0]
                        )
                      }
                      className="w-full border p-3 rounded-2xl mt-2"
                    />

                  </div>

                  <div>

                    <label className="font-bold text-sm text-gray-500">
                      Ảnh bảng thông số
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSpecImage(
                          e.target.files[0]
                        )
                      }
                      className="w-full border p-3 rounded-2xl mt-2"
                    />

                  </div>

                </div>

                {/* RIGHT */}
                <div>

                  <Editor
                    apiKey="gv0dobysumfihba6i2rhdg3v79x9bvpa2e33l13gmng5f0qv"
                    value={
                      modelForm.description
                    }
                    onEditorChange={(
                      content
                    ) =>
                      setModelForm({
                        ...modelForm,
                        description:
                          content
                      })
                    }
                    init={{
                      height: 500
                    }}
                  />

                </div>

              </div>

              {/* ACTION */}
              <div className="flex justify-end gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setIsEditingModel(false)
                  }
                  className="px-8 py-3 bg-gray-200 rounded-2xl font-bold"
                >
                  HỦY
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-blue-900 text-white rounded-2xl font-bold"
                >
                  {loading
                    ? 'ĐANG LƯU...'
                    : 'CẬP NHẬT'}
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