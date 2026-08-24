const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    type: {
      type: String,
      enum: ['reminder', 'update', 'cancellation', 'cancellation_user', 'registration', 'system'],
      default: 'system',
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.isRead = ret.read;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.isRead = ret.read;
        return ret;
      },
    },
  }
);

notificationSchema.virtual('isRead').get(function () {
  return this.read;
});

notificationSchema.virtual('id').get(function () {
  return this._id ? this._id.toHexString() : undefined;
});

module.exports = mongoose.model('Notification', notificationSchema);