import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Editor } from '@tinymce/tinymce-react';

const FALLBACK_IMG =
  'https://dummyimage.com/600x400/e5e7eb/6b7280&text=No+Image';

const AdminVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= MODEL =================
  const [isEditingModel, setIsEditingModel] =
    useState(false);

  const [modelForm, setModelForm] =
    useState({
      name: '',
      type: 'SUV',
      seats: 5,
      aliases: '',
      description: '',
      isHot: false
    });

  const [mainImage, setMainImage] =
    useState(null);

  const [specImage, setSpecImage] =
    useState(null);

  // ================= VARIANT =================
  const [editingVariant, setEditingVariant] =
    useState(null);

  const [variantForm, setVariantForm] =
    useState({
      variantName: '',
      aliases: '',
      basePrice: '',
      transmission: '',
      driveTrain: '',
      fuelType: '',

      // ================= SPECS =================
      engine: '',
      horsepower: '',
      torque: '',
      fuelConsumption: '',

      // ================= FEATURES =================
      adas: false,
      turbo: false,
      camera360: false,
      sunroof: false,
      abs: false,

      // ================= HOT =================
      isHot: false
    });

  // ================= COLOR =================
  const [selectedModel, setSelectedModel] =
    useState(null);

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [colors, setColors] = useState([]);

  const [editingColor, setEditingColor] =
    useState(null);

  const [colorForm, setColorForm] =
    useState({
      name: '',
      hexCode: ''
    });

  const [colorImages, setColorImages] =
    useState([]);

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
      aliases:
        model.aliases?.join(', ') || '',
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
        'aliases',
        modelForm.aliases
      );

      formData.append(
        'description',
        modelForm.description
      );

      formData.append(
        'isHot',
        modelForm.isHot
      );

      if (mainImage) {
        formData.append(
          'images',
          mainImage
        );
      }

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

  // ================= EDIT VARIANT =================
  const handleEditVariant = (variant) => {
    setEditingVariant(variant);

    setVariantForm({
      variantName:
        variant.variantName || '',

      aliases:
        variant.aliases?.join(', ') || '',

      basePrice:
        variant.basePrice || '',

      transmission:
        variant.transmission || '',

      driveTrain:
        variant.driveTrain || '',

      fuelType:
        variant.fuelType || '',

      // ================= SPECS =================
      engine:
        variant?.specs?.engine || '',

      horsepower:
        variant?.specs?.horsepower || '',

      torque:
        variant?.specs?.torque || '',

      fuelConsumption:
        variant?.specs
          ?.fuelConsumption || '',

      // ================= FEATURES =================
      adas:
        variant?.features?.adas || false,

      turbo:
        variant?.features?.turbo || false,

      camera360:
        variant?.features?.camera360 ||
        false,

      sunroof:
        variant?.features?.sunroof ||
        false,

      abs:
        variant?.features?.abs || false,

      // ================= HOT =================
      isHot:
        variant?.isHot || false
    });
  };

  // ================= UPDATE VARIANT =================
  const handleUpdateVariant =
    async () => {
      try {
        await api.put(
          `/vehicles/variants/${editingVariant._id}`,
          {
            variantName:
              variantForm.variantName,

            aliases:
              variantForm.aliases
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean),

            basePrice: Number(
              variantForm.basePrice
            ),

            transmission:
              variantForm.transmission,

            driveTrain:
              variantForm.driveTrain,

            fuelType:
              variantForm.fuelType,

            // ================= SPECS =================
            specs: {
              engine:
                variantForm.engine,

              horsepower: Number(
                variantForm.horsepower
              ) || 0,

              torque: Number(
                variantForm.torque
              ) || 0,

              fuelConsumption:
                variantForm.fuelConsumption
            },

            // ================= FEATURES =================
            features: {
              adas:
                variantForm.adas,

              turbo:
                variantForm.turbo,

              camera360:
                variantForm.camera360,

              sunroof:
                variantForm.sunroof,

              abs:
                variantForm.abs
            },

            // ================= HOT =================
            isHot:
              variantForm.isHot
          }
        );

        alert(
          'Cập nhật phiên bản thành công'
        );

        setEditingVariant(null);

        fetchVehicles();
      } catch (err) {
        console.error(err);

        alert(
          err.response?.data?.error ||
            'Lỗi cập nhật phiên bản'
        );
      }
    };

  // ================= DELETE VARIANT =================
  const handleDeleteVariant =
    async (id) => {
      if (
        !window.confirm(
          'Bạn có chắc chắn muốn xóa phiên bản này?'
        )
      )
        return;

      try {
        await api.delete(
          `/vehicles/variants/${id}`
        );

        alert(
          'Xóa phiên bản thành công'
        );

        fetchVehicles();
      } catch (err) {
        console.error(err);

        alert(
          err.response?.data?.message ||
            'Lỗi xóa phiên bản'
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
    <>
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-blue-900">
          QUẢN LÝ DÒNG XE FORD
        </h2>

        <button className="bg-blue-900 text-white px-5 py-3 rounded-xl font-bold">
          + THÊM XE
        </button>
      </div>

      <div className="space-y-6">
        {vehicles.map((v) => (
          <div
            key={v._id}
            className="bg-white rounded-3xl p-6 shadow"
          >
            <div className="flex flex-col md:flex-row gap-8">
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
                                  0
                                ).toLocaleString()}{' '}
                                VNĐ
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleEditVariant(
                                    variant
                                  )
                                }
                                className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold"
                              >
                                Sửa
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteVariant(
                                    variant._id
                                  )
                                }
                                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                              >
                                Xóa
                              </button>

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
                          </div>
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

      {/* ================= EDIT MODEL MODAL ================= */}

      {isEditingModel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto p-10">
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

            <form
              onSubmit={handleUpdateModel}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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

                  <input
                    type="text"
                    placeholder="Aliases"
                    value={modelForm.aliases}
                    onChange={(e) =>
                      setModelForm({
                        ...modelForm,
                        aliases:
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
                </div>
                <div className="space-y-3">

  <label className="font-bold">
    Ảnh đại diện
  </label>

  {selectedModel?.images?.[0] && (
    <img
      src={selectedModel.images[0]}
      alt=""
      className="w-full h-48 object-contain border rounded-2xl"
    />
  )}

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setMainImage(
        e.target.files[0]
      )
    }
    className="w-full border p-3 rounded-xl"
  />
</div>
<div className="space-y-3">

  <label className="font-bold">
    Ảnh bảng thông số
  </label>

  {selectedModel?.imageUrl && (
    <img
      src={selectedModel.imageUrl}
      alt=""
      className="w-full h-48 object-contain border rounded-2xl"
    />
  )}

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setSpecImage(
        e.target.files[0]
      )
    }
    className="w-full border p-3 rounded-xl"
  />
</div>

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

      {/* ================= EDIT VARIANT MODAL ================= */}

{editingVariant && (

  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5">

```
<div className="bg-white rounded-[2rem] w-full max-w-7xl max-h-[95vh] overflow-y-auto p-10">

  <div className="flex justify-between items-center border-b pb-5 mb-8">

    <h3 className="text-3xl font-black text-blue-900">
      Chỉnh sửa phiên bản
    </h3>

    <button
      onClick={() =>
        setEditingVariant(null)
      }
      className="text-3xl text-gray-400 hover:text-red-500"
    >
      ✕
    </button>

  </div>

  {/* ================= THÔNG TIN CHUNG ================= */}

  <div className="mb-10">

    <h4 className="font-black text-xl text-blue-900 mb-5">
      Thông tin chung
    </h4>

    <div className="grid md:grid-cols-3 gap-5">

      <input
        type="text"
        placeholder="Tên phiên bản"
        value={variantForm.variantName}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            variantName:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        type="text"
        placeholder="Alias"
        value={variantForm.aliases}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            aliases:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        type="number"
        placeholder="Giá"
        value={variantForm.basePrice}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            basePrice:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        type="text"
        placeholder="Hộp số"
        value={variantForm.transmission}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            transmission:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        type="text"
        placeholder="Dẫn động"
        value={variantForm.driveTrain}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            driveTrain:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        type="text"
        placeholder="Nhiên liệu"
        value={variantForm.fuelType}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            fuelType:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

    </div>

  </div>

  {/* ================= THÔNG SỐ KỸ THUẬT ================= */}

  <div className="mb-10">

    <h4 className="font-black text-xl text-blue-900 mb-5">
      Thông số kỹ thuật
    </h4>

    <div className="grid md:grid-cols-4 gap-5">

      <input
        placeholder="Động cơ"
        value={variantForm.engine}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            engine:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Mã lực"
        value={variantForm.horsepower}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            horsepower:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Mô men xoắn"
        value={variantForm.torque}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            torque:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Tiêu hao nhiên liệu"
        value={variantForm.fuelConsumption}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            fuelConsumption:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Số chỗ"
        value={variantForm.seats}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            seats:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Mâm xe"
        value={variantForm.wheelSize}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            wheelSize:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Bình nhiên liệu"
        value={variantForm.fuelTank}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            fuelTank:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Khoảng sáng gầm"
        value={variantForm.groundClearance}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            groundClearance:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Chiều dài cơ sở"
        value={variantForm.wheelbase}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            wheelbase:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Dài"
        value={variantForm.length}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            length:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Rộng"
        value={variantForm.width}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            width:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

      <input
        placeholder="Cao"
        value={variantForm.height}
        onChange={(e)=>
          setVariantForm({
            ...variantForm,
            height:e.target.value
          })
        }
        className="border p-4 rounded-2xl"
      />

    </div>

  </div>

  {/* ================= TÍNH NĂNG ================= */}

  <div className="mb-10">

    <h4 className="font-black text-xl text-blue-900 mb-5">
      Trang bị & Công nghệ
    </h4>

    <div className="grid md:grid-cols-4 gap-4">

      {[
        "turbo",
        "abs",
        "adas",
        "adaptiveCruise",
        "blindSpot",
        "laneKeepAssist",
        "autoEmergencyBrake",
        "rearCrossTrafficAlert",
        "trafficSignRecognition",
        "camera360",
        "reverseCamera",
        "parkingSensorFront",
        "parkingSensorRear",
        "sunroof",
        "wirelessCharging",
        "powerTailgate",
        "autoHeadlamp",
        "autoWiper",
        "ambientLight",
        "leatherSeat",
        "ventilatedSeat",
        "heatedSeat",
        "powerDriverSeat",
        "powerPassengerSeat",
        "appleCarplay",
        "androidAuto",
        "sync4",
        "fordPass",
        "premiumAudio",
        "powerSlidingDoor",
        "powerRunningBoard",
        "luggageRack",
        "foldableLastRow",
        "isHot"
      ].map((field)=>(
        <label
          key={field}
          className="flex items-center gap-2 font-semibold"
        >
          <input
            type="checkbox"
            checked={variantForm[field]}
            onChange={(e)=>
              setVariantForm({
                ...variantForm,
                [field]:e.target.checked
              })
            }
          />

          {field}
        </label>
      ))}

    </div>

  </div>

  <div className="flex justify-end gap-4">

    <button
      onClick={() =>
        setEditingVariant(null)
      }
      className="px-8 py-3 bg-gray-200 rounded-2xl font-bold"
    >
      Hủy
    </button>

    <button
      onClick={handleUpdateVariant}
      className="px-10 py-3 bg-blue-900 text-white rounded-2xl font-bold"
    >
      Cập nhật
    </button>

  </div>

</div>
```

  </div>
)}

    </div>
    {/* ================= COLOR MODAL ================= */}

{selectedVariant && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5">

    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-10 space-y-8">

      <div className="flex justify-between items-center border-b pb-4">

        <div>
          <h3 className="text-3xl font-black text-blue-900">
            Quản lý màu xe
          </h3>

          <p className="text-gray-500 font-semibold mt-1">
            {selectedVariant.variantName}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedVariant(null);
            setEditingColor(null);
          }}
          className="text-3xl text-gray-400 hover:text-red-500"
        >
          ✕
        </button>

      </div>

      {/* ================= FORM ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <input
          type="text"
          placeholder="Tên màu"
          value={colorForm.name}
          onChange={(e) =>
            setColorForm({
              ...colorForm,
              name: e.target.value
            })
          }
          className="border p-4 rounded-2xl"
        />

        <input
          type="text"
          placeholder="#ffffff"
          value={colorForm.hexCode}
          onChange={(e) =>
            setColorForm({
              ...colorForm,
              hexCode: e.target.value
            })
          }
          className="border p-4 rounded-2xl"
        />

      </div>

      <input
        type="file"
        multiple
        onChange={(e) =>
          setColorImages(
            Array.from(e.target.files)
          )
        }
        className="w-full border p-4 rounded-2xl"
      />

      <div className="flex gap-4">

        {editingColor ? (
          <button
            onClick={handleUpdateColor}
            className="bg-yellow-500 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Cập nhật màu
          </button>
        ) : (
          <button
            onClick={handleAddColor}
            className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Thêm màu
          </button>
        )}

      </div>

      {/* ================= COLOR LIST ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {colors.map((color) => (
          <div
            key={color._id}
            className="border rounded-3xl p-5 bg-gray-50 space-y-4"
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
                  <h4 className="font-black text-lg">
                    {color.name}
                  </h4>

                  <p className="text-sm text-gray-500">
                    {color.hexCode}
                  </p>
                </div>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => {
                    setEditingColor(color);

                    setColorForm({
                      name: color.name,
                      hexCode:
                        color.hexCode
                    });
                  }}
                  className="bg-yellow-400 px-4 py-2 rounded-xl font-bold"
                >
                  Sửa
                </button>

                <button
                  onClick={() =>
                    handleDeleteColor(
                      color._id
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                >
                  Xóa
                </button>

              </div>

            </div>

            {/* ================= IMAGES ================= */}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {color.images?.map(
                (img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={color.name}
                    className="w-full h-32 object-cover rounded-2xl border"
                  />
                )
              )}

            </div>

          </div>
        ))}

      </div>

    </div>

  </div>
)}
</>
    
  );
  
};

export default AdminVehicle;