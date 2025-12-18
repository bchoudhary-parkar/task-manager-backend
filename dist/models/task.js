import mongoose, { Schema } from 'mongoose';
const SubTaskSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { _id: false });
const TaskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
        default: 'TODO',
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM',
        required: [true, 'priority is required'],
    },
    assignedTo: {
        type: Schema.Types.ObjectId, // FIXED: Changed from String to ObjectId
        ref: 'user', // Reference to User model
        // required: [true, 'Assigned user is required'],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    dueDate: {
        type: Date,
        required: [true, 'DueDate is required'],
    },
    tags: {
        type: [String],
        default: [],
    },
    subtasks: {
        type: [SubTaskSchema],
        default: [],
    },
}, {
    timestamps: true,
});
// Indexes for better search performance
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ createdAt: -1 });
export default mongoose.model('Task', TaskSchema);
//# sourceMappingURL=task.js.map