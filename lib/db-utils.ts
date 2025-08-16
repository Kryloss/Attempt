import dbConnect from './mongodb';
import Email from '@/models/Email';
import User from '@/models/User';

export async function getEmailStats() {
    await dbConnect();

    const stats = await Email.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    return stats;
}

export async function getRecentEmails(limit: number = 10) {
    await dbConnect();

    const emails = await Email.find({})
        .sort({ createdAt: -1 })
        .limit(limit);

    return emails;
}

export async function getTotalEmailCount() {
    await dbConnect();

    const count = await Email.countDocuments();
    return count;
}

export async function createUser(email: string, name: string) {
    await dbConnect();

    const user = new User({ email, name });
    await user.save();

    return user;
}

export async function findUserByEmail(email: string) {
    await dbConnect();

    const user = await User.findOne({ email });
    return user;
}

export async function getAllUsers() {
    await dbConnect();

    const users = await User.find({}).sort({ createdAt: -1 });
    return users;
}
