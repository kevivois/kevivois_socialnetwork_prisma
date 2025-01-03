import { useState, useEffect } from 'react';
import axios from '../axios.call'
import { MessageSquare, Heart, Share2 } from 'lucide-react';
import CreatePost from '../components/CreatePost';
import { Link } from 'react-router-dom';


const Feed = () => {
  const [posts, setPosts] = useState<Array<any>>([]);

  useEffect(() => {
    fetchPosts();
  }, []);
  
  const likeAPost = async (postId:any)=>{
    const response = await axios.get("/user/posts/"+postId+"/like");
    if(response.data.post){
      let newPosts:Array<any> = [...posts]
      let idx = newPosts.findIndex((p:any) => p.id == postId);
      newPosts[idx] = response.data.post
      setPosts(newPosts)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/user/posts/all');
      console.log(response.data.posts)
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };


  return (
    <div className="max-w-2xl mx-auto">
      <CreatePost onPostCreated={fetchPosts} />
      
      <div className="space-y-6 mt-8">
        {posts != null && posts.length > 0 && posts.map((post: any) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="ml-3">
                <Link to={`/profile/${post.author.id}`}><h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                </Link>
                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <p className="text-gray-800 mb-4">{post.content}</p>
            <div className="flex items-center space-x-4 text-gray-500">
              <button className="flex items-center space-x-2 hover:text-blue-500">
                <Heart className="w-5 h-5"onClick={() => likeAPost(post.id)} />
                <span>{post.likes?.length}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-500">
                <MessageSquare className="w-5 h-5" />
                <span>{post.childrens}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-500">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Feed;