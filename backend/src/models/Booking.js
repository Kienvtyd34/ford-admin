import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },

    vin: {
        type: String,
        required: true
    },

    variantName: {
        type: String,
        required: true
    },

    colorName: {
        type: String,
        required: true
    },

    depositAmount: {
        type: Number,
        default: 2000
    },

    paymentStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Cancelled'],
        default: 'Pending'
    },

    paymentBillUrl: {
        type: String,
        default: null
    },

    orderStatus: {
        type: String,
        enum: ['Processing', 'Confirmed', 'Completed'],
        default: 'Processing'
    },

    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    notes: String

}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);