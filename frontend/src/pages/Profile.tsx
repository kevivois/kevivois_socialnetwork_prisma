import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios.call';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Users } from 'lucide-react';

const Profile = () => {
  let currentUser = useAuth().user;
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]); 
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'followers' | 'following'>('posts');
  const [likedPosts, setLikedPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (user) {
      fetchLikedPosts();
    }
  }, [user]);

  const fetchLikedPosts = async () => {
    try {
      const response = await axios.get(`/user/${userId}/liked-posts`);
      setLikedPosts(response.data.likedPosts || []);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  };

  const tabClasses = (tab: string) =>
    `px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${
      activeTab === tab
        ? 'bg-blue-500 text-white shadow'
        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
    }`;

  const renderUserInfo = () => (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      <img
        src={user.avatar || '/default-avatar.png'}
        alt="Avatar"
        className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-lg object-cover"
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
        <p className="text-gray-500 mb-2">@{user.id}</p>
        <p className="text-gray-700 mb-1">{user.bio || 'No bio provided.'}</p>
        <p className="text-gray-600 mb-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        <p className="text-gray-600 mb-1">Email: {user.email}</p>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-1 text-gray-500" />
            <span className="font-medium">{followers.length}</span>
            <span className="ml-1 text-gray-500">Followers</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-1 text-gray-500" />
            <span className="font-medium">{following.length}</span>
            <span className="ml-1 text-gray-500">Following</span>
          </div>
        </div>
        {currentUser.id !== user.id && (
          <button
            onClick={handleFollow}
            className="mt-4 flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:scale-105 transition-transform"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {user.followers?.find((f: any) => f.id === currentUser.id) ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-6">
            {posts.length > 0 ? posts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="Post content" className="rounded-lg mb-4 max-h-64 object-cover" />
                )}
                <div className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            )) : <div className="text-gray-500">No posts yet.</div>}
          </div>
        );
      case 'liked':
        return (
          <div className="space-y-6">
            {likedPosts.length > 0 ? likedPosts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="Liked post" className="rounded-lg mb-4 max-h-64 object-cover" />
                )}
                <div className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            )) : <div className="text-gray-500">No liked posts yet.</div>}
          </div>
        );
      case 'followers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followers.length > 0 ? followers.map((f: any) => (
              <div key={f.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <img src={f.avatar || '/default-avatar.png'} alt="Follower" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{f.username}</div>
                  <div className="text-gray-500 text-sm">@{f.id}</div>
                </div>
              </div>
            )) : <div className="text-gray-500">No followers yet.</div>}
          </div>
        );
      case 'following':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {following.length > 0 ? following.map((f: any) => (
              <div key={f.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <img src={f.avatar || '/default-avatar.png'} alt="Following" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{f.username}</div>
                  <div className="text-gray-500 text-sm">@{f.id}</div>
                </div>
              </div>
            )) : <div className="text-gray-500">Not following anyone yet.</div>}
          </div>
        );
      default:
        return null;
    }
  };

  const fetchUserData = async () => {
    try {
      let response = await axios.get('/user/' + userId);
      setUser(response.data.user);
      setPosts(response.data.user.posts)
      setFollowers(response.data.user.followers)
      setFollowing(response.data.user.following)
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleFollow = async () => {
    try {
      let response = await axios.get(`/user/follow/${userId}`);
      if (!response.data.user) {
        throw new Error("server error")
      } else {
        setUser(response.data.user)
        setFollowers(response.data.user.followers)
        setFollowing(response.data.user.following)
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {renderUserInfo()}
        <div className="mt-6 flex border-b">
          <button className={tabClasses('posts')} onClick={() => setActiveTab('posts')}>Posts</button>
          <button className={tabClasses('liked')} onClick={() => setActiveTab('liked')}>Liked</button>
          <button className={tabClasses('followers')} onClick={() => setActiveTab('followers')}>Followers</button>
          <button className={tabClasses('following')} onClick={() => setActiveTab('following')}>Following</button>
        </div>
      </div>
      <div className="py-6">{renderTabContent()}</div>
    </div>
  );
};

export default Profile;
