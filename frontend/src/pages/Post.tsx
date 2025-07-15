import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../axios.call';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import CreatePost from '../components/CreatePost';

function Post() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReply, setShowReply] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/user/posts/${id}`);
      setPost(response.data.post);
    } catch (err) {
      setError('Failed to fetch post.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!post) return <div className="text-center text-gray-500 mt-10">No post found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>
      </div>

      {/* Post main content */}
      <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/profile/${post.author.id}`}>
            <h3 className="font-semibold text-gray-800 hover:underline">{post.author.username}</h3>
          </Link>
          <span className="text-xs text-gray-400 ml-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-gray-800 text-base whitespace-pre-wrap">{post.content}</p>

        <button
          onClick={() => setShowReply((prev) => !prev)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          {showReply ? "Cancel" : "Reply to this post"}
        </button>
      </div>

      {/* Create reply */}
      {showReply && (
        <div className="mt-4">
          <CreatePost parent={post.id} onPostCreated={fetchPost} />
        </div>
      )}

      {/* Comment list */}
      <div className="mt-6 space-y-4">
        {post.childrens && post.childrens.length > 0 && (
          <h4 className="text-md font-semibold text-gray-700 mb-2">Comments</h4>
        )}

        {post.childrens?.map((child: any) => (
          <div
            key={child.id}
            className="px-4 py-3 border-l-4 border-blue-200 bg-blue-50 rounded"
          >
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{child.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              — {child.author.username}, {new Date(child.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Post;
