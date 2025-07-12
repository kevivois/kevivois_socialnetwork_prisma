import React, { useState } from 'react';
import { Image, Send } from 'lucide-react';
import axios from '../axios.call'
const CreatePost = ({ onPostCreated,parent }: { onPostCreated: () => void,parent:String|null }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/user/posts/create', { content, image,parent });
      setContent('');
      setImage('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-4 text-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => setImage(prompt('Enter image URL:') || '')}
          className="flex items-center text-gray-500 hover:text-blue-500"
        >
          <Image className="w-5 h-5 mr-2" />
          Add Image
        </button>
        
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Send className="w-4 h-4 mr-2" />
          Post
        </button>
      </div>
      
      {image && (
        <div className="mt-4">
          <img src={image} alt="Preview" className="max-h-60 rounded-lg" />
          <button
            type="button"
            onClick={() => setImage('')}
            className="mt-2 text-red-500 text-sm"
          >
            Remove image
          </button>
        </div>
      )}
    </form>
  );
};
export default CreatePost;