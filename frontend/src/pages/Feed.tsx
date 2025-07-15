import { useState, useEffect } from 'react';
import axios from '../axios.call';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Share2,ChevronsDownUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreatePost from '../components/CreatePost';
import { Link } from 'react-router-dom';
import AnswerPost from '../components/AnswerPost';


const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [commentPostId, setCommentPostId] = useState<string>("");

  const { user,reFetch } = useAuth();

  const naviguate = useNavigate();

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <CreatePost onPostCreated={fetchPosts} parent={null} />

      {/* Notification Popup */}
      <div
      id="copy-notice"
      className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-all opacity-0 pointer-events-none"
      style={{ transition: 'opacity 0.3s, transform 0.3s' }}
      >
      Post URL copied!
      </div>

      <div className="space-y-8 mt-10">
      {posts.map((post) => (
        <div
        key={post.id}
        className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-200 hover:border-blue-300 relative group"
        onClick={() => naviguate("/post/" + post.id)}
        >
        <div className="flex items-center gap-4 mb-5">
          <div onClick={(e) => e.stopPropagation()}>
          <Link to={`/profile/${post.author.id}`}>
            <h3 className="font-bold text-lg text-gray-800 hover:underline">{post.author.username}</h3>
          </Link>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          </div>
        </div>

        <p className="text-gray-700 text-base mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        <div className="flex items-center space-x-6 text-gray-500 text-base">
          <button
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition hover:bg-red-50 hover:text-red-500 ${Array.isArray(user.likedPosts) && user.likedPosts.find((p: any) => p.id === post.id) ? 'bg-red-100 text-red-500' : ''}`}
          onClick={(e) => {
            likeAPost(post.id);
            e.stopPropagation();
          }}
          >
          <Heart
            className="w-5 h-5"
            color={Array.isArray(user.likedPosts) && user.likedPosts.find((p: any) => p.id === post.id) ? 'pink' : ''}
            fill={Array.isArray(user.likedPosts) && user.likedPosts.find((p: any) => p.id === post.id) ? 'pink' : ''}
          />
          <span className="font-semibold">{post.likes?.length || 0}</span>
          </button>
          <button
          className="flex items-center gap-2 px-3 py-1 rounded-full transition hover:bg-blue-50 hover:text-blue-500"
          onClick={(e) => {
            e.stopPropagation();
            setCommentPostId((prev) => (prev === post.id ? "" : post.id));
          }}
          >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">{post.childrens?.length || 0}</span>
          </button>
          <button
          className="flex items-center gap-2 px-3 py-1 rounded-full transition hover:bg-green-50 hover:text-green-600"
          onClick={async (e) => {
            e.stopPropagation();
            try {
            await navigator.clipboard.writeText(window.location.origin + "/post/" + post.id);
            // Show a smooth popup notification
            const notice = document.getElementById("copy-notice");
            if (notice) {
              notice.style.opacity = "1";
              notice.style.pointerEvents = "auto";
              notice.style.transform = "translate(-50%, 0)";
              setTimeout(() => {
              notice.style.opacity = "0";
              notice.style.pointerEvents = "none";
              notice.style.transform = "translate(-50%, -10px)";
              }, 1200);
            }
            } catch {
            // fallback if clipboard fails
            }
          }}
          >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {commentPostId === post.id ? (
          <div className="mt-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <AnswerPost onPostCreated={fetchPosts} parent={commentPostId} />
          </div>
        ) : null}
        </div>
      ))}
      </div>
    </div>
  );
};

export default Feed;
