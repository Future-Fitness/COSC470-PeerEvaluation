import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, getMyProfile, UserProfile } from '../util/api';
import { User, Mail, GraduationCap, BookOpen, Loader2 } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: UserProfile;
        if (id) {
          // Fetch specific user's profile
          data = await getProfile(id);
        } else {
          // Fetch current user's profile
          data = await getMyProfile();
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-500 dark:text-primary-400 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No profile found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-8 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700" />

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar - Gummy Bear */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center overflow-hidden shadow-lg">
                <span className="text-6xl" role="img" aria-label="gummy bear">🐻</span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              {/* Name & Role Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  profile.isTeacher
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {profile.isTeacher ? (
                    <>
                      <BookOpen className="w-4 h-4" />
                      Teacher
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4" />
                      Student
                    </>
                  )}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{profile.email}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">#{profile.id}</p>
                  </div>
                </div>
              </div>

              {/* Account Type Info */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Account Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.isTeacher
                    ? 'As a teacher, you can create classes, manage assignments, create rubrics, and organize student groups for peer reviews.'
                    : 'As a student, you can join classes, submit assignments, and participate in peer reviews with your classmates.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
