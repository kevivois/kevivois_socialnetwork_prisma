import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../axios.call';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Heart, Share2, MessageCircle, X } from 'lucide-react';
import CreatePost from '../components/CreatePost';

function Post() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReply, setShowReply] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const { user,reFetch } = useAuth();
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/user/posts/${id}`);
      console.log(response.data)
      setPost(response.data.post);
      setLiked(response.data.post.likes?.find((u:any) => u.id === user.id));
    } catch (err) {
      setError('Failed to fetch post.');
    } finally {
      setLoading(false);
    }
  };

  const likeAPost = async () => {
    try {
      const response = await axios.get(`/user/posts/${post.id}/like`);
      const updatedPost = response.data.post;
      if (updatedPost) {
        setPost(updatedPost);
        setLiked(updatedPost.likes?.find((u:any) => u.id === user.id));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
    finally {
      await reFetch();
    }
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line
  }, [id]);


  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!post) return <div className="text-center text-gray-500 mt-10">No post found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      {/* Smooth popup */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg animate-fade-in">
            <span>Link copied to clipboard!</span>
            <button
              onClick={() => setShowPopup(false)}
              className="ml-2 p-1 rounded hover:bg-green-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </button>
      </div>

      {/* Post main content */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg transition p-8 border border-gray-200">
        <div className="flex items-center gap-4 mb-5">
          <Link to={`/profile/${post.author.id}`}>
            <h3 className="font-bold text-lg text-gray-900 hover:underline">{post.author.username}</h3>
          </Link>
          <span className="text-xs text-gray-400 ml-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-gray-900 text-base whitespace-pre-wrap mb-6">{post.content}</p>

        <div className="flex gap-6 items-center mt-2">
          <button
            onClick={likeAPost}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
              liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            <span>{post.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowReply((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-blue-600 hover:bg-blue-50 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{showReply ? "Cancel" : "Reply"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-green-600 hover:bg-green-50 transition"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Create reply */}
      {showReply && (
        <div className="mt-6">
          <CreatePost parent={post.id} onPostCreated={fetchPost} />
        </div>
      )}

      {/* Comment list */}
      <div className="mt-8 space-y-5" style={{ maxHeight: '70vh', overflowY: 'auto', msOverflowStyle: 'none', }}>
        {post.childrens && post.childrens.length > 0 && (
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Comments</h4>
        )}

        {post.childrens?.map((child: any) => (
          <div
            key={child.id}
            className="px-5 py-4 border-l-4 border-blue-300 bg-blue-50 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${child.author.id}`}>
                <span className="font-medium text-blue-700 hover:underline">{child.author.username}</span>
              </Link>
              <span className="text-xs text-gray-400">
                {new Date(child.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{child.content}</p>
          </div>
        ))}
      </div>
      {/* Animation for popup */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default Post;
