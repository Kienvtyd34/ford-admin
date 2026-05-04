    import Contact  from "../models/Contact.js";
    import TestDrive from "../models/TestDrive.js";
    import Inventory from "../models/Inventory.js";

    //Khách hàng gửi form
    export const sendRequest = async(req, res)=>{
        try{
            const newContact = await Contact.create(req.body);
            res.status(201).json({success: true, message: "Yêu cầu của bạn được gửi thành công"});
        }catch(error){
            res.status(400).json({success: false, error: error.message});
        };
    };

    //Admin lấy danh sách khách hàng
    export const getContacts = async(req, res)=>{
        try{
            const contacts = await Contact.find().sort({createdAt: -1});
            res.status(200).json({success:true, data: contacts});
        }catch(error){
            res.status(500).json({success: false, error: error.message});
        }
    };


    export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Trả về dữ liệu sau khi đã cập nhật
        );

        if (!updatedContact) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng" });
        }

        res.status(200).json({ success: true, data: updatedContact });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDemoVehicles = async (req, res) => {
  try {
    const items = await Inventory.find({
      category: "Demo"
    })
      .populate({
        path: "variantId",
        populate: { path: "modelId" }
      })
      .populate("colorId")
      .lean();

    const data = items.map(i => {
      const color = i.colorId;

      return {
        _id: i._id,

        modelName: i.variantId?.modelId?.name,
        variantName: i.variantId?.variantName,

        // ✅ FIX ẢNH
        image:
          color?.images?.length > 0
            ? color.images[0]
            : i.variantId?.modelId?.imageUrl,

        // ✅ FIX COLOR
        color: color
          ? {
              name: color.name,
              hexCode: color.hexCode,
              images: color.images
            }
          : null
      };
    });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createTestDrive = async (req, res) => {
    try {
        const { customerName, phone, inventoryId, date, timeSlot } = req.body;

        // ❗ kiểm tra trùng lịch
        const existed = await TestDrive.findOne({
            inventoryId,
            date,
            timeSlot,
            status: { $in: ["Pending", "Confirmed"] }
        });

        if (existed) {
            return res.status(400).json({ message: "Xe đã có người đặt khung giờ này" });
        }

        const booking = await TestDrive.create({
            customerName,
            phone,
            inventoryId,
            date,
            timeSlot
        });

        res.json({ success: true, data: booking });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getTestDrives = async (req, res) => {
    try {
        const data = await TestDrive.find()
            .populate({
                path: 'inventoryId',
                populate: {
                    path: 'variantId',
                    populate: { path: 'modelId' }
                }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const updateTestDriveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await TestDrive.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};