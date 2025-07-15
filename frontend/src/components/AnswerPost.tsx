import React, { useState } from 'react';
import { Image, Send, MessageCircle } from 'lucide-react';
import axios from '../axios.call';

const AnswerPost = ({ onPostCreated, parent }: { onPostCreated: () => void, parent: String }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/user/posts/create', { content, image, parent });
      setContent('');
      setImage('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  return (
    <div className="ml-8 mt-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          className="w-full p-3 text-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          autoFocus
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setImage(prompt('Enter image URL:') || '')}
              className="flex items-center text-gray-500 hover:text-blue-500 text-sm transition-colors"
            >
              <Image className="w-4 h-4 mr-1" />
              Image
            </button>
            
            <button
              type="button"
              onClick={() => {
                setContent('');
                setImage('');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm transition-colors"
          >
            <Send className="w-3 h-3 mr-1" />
            Reply
          </button>
        </div>
        
        {image && (
          <div className="mt-3">
            <img src={image} alt="Preview" className="max-h-40 rounded-lg" />
            <button
              type="button"
              onClick={() => setImage('')}
              className="mt-2 text-red-500 text-sm hover:text-red-700 transition-colors"
            >
              Remove image
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AnswerPost;