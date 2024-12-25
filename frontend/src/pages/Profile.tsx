import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios.call';
import { UserPlus, Users } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
    fetchFollowers();
    fetchFollowing();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/user/me');
      setUser(response.data.user);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/user/posts/from/${userId}`);
      console.log(response.data)
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await axios.get('/user/followers');
      setFollowers(response.data.followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axios.get('/user/following');
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.get(`/follow/${userId}`);
      fetchFollowers();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center">
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.username}</p>
            
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-medium">{followers.length}</span>
                <span className="ml-1 text-gray-500">Followers</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-medium">{following.length}</span>
                <span className="ml-1 text-gray-500">Following</span>
              </div>
            </div>
            
            {userId !== user.id && (
              <button
                onClick={handleFollow}
                className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {posts != null && posts.length > 0 && posts.map((post: any) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-800 mb-4">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post content" className="rounded-lg mb-4" />
            )}
            <div className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Profile