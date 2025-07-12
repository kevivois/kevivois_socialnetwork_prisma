import { useState, useEffect } from 'react';
import axios from '../axios.call';
import { MessageSquare, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreatePost from '../components/CreatePost';
import { Link } from 'react-router-dom';


const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [commentPostId, setCommentPostId] = useState<string>("");

  const { user,reFetch } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/user/posts/all');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const likeAPost = async (postId: string) => {
    try {
      const response = await axios.get(`/user/posts/${postId}/like`);
      const updatedPost = response.data.post;
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p))
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
    finally {
      await reFetch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <CreatePost onPostCreated={fetchPosts} parent={null} />

      <div className="space-y-6 mt-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div>
                <Link to={`/profile/${post.author.id}`}>
                  <h3 className="font-semibold text-gray-800 hover:underline">{post.author.username}</h3>
                </Link>
                <p className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 whitespace-pre-wrap">{post.content}</p>

            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <button
                className="flex items-center gap-1 hover:text-red-500"
                onClick={() => likeAPost(post.id)}
              >
                <Heart className="w-4 h-4"  color={Array.isArray(user.likedPosts) && user.likedPosts.find((p:any) => p.id === post.id) ? 'pink' : '' } fill={Array.isArray(user.likedPosts) && user.likedPosts.find((p:any) => p.id === post.id) ? 'pink' : '' } />
                <span>{post.likes?.length || 0}</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-blue-500"
                onClick={() =>
                  setCommentPostId((prev) => (prev === post.id ? "" : post.id))
                }
              >
                <MessageSquare className="w-4 h-4" />
                <span>{post.childrens?.length || 0}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-green-500">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {commentPostId === post.id && (
              <div className="mt-4 space-y-4">
                <CreatePost onPostCreated={fetchPosts} parent={post.id} />
                {post.childrens?.map((child:any) => (
                  <div
                    key={child.id}
                    className="ml-4 px-4 py-2 border-l-4 border-blue-200 bg-blue-50 rounded"
                  >
                    <p className="text-sm text-gray-700">{child.content}</p>
                    <p className="text-xs text-gray-400">
                      — {child.author.username},{" "}
                      {new Date(child.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
