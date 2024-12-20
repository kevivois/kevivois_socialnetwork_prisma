import PrismaSingleton from '../Connection.js'; // Adjust the path to your file if needed
const client = new PrismaSingleton().client;

export async function areFriends(userId, otherUserIds) {
  try {
    // Fetch the mutual follow relationships
    const friendships = await client.follows.findMany({
      where: {
        AND: [
          {
            followerId: userId,
          },
          {
            followingId: {
              in: otherUserIds, // Check if the given user is following any of the otherUserIds
            },
          },
        ],
      },
      select: {
        followingId: true,
      },
    });
    // Extract the list of friends (mutual follows)
    const friendIds = friendships.map((friendship) => friendship.followingId);
    // Check if all provided IDs are friends with the user
    return otherUserIds.every((id) => friendIds.includes(id));
  } catch (error) {
    console.error('Error checking friendships:', error);
    return false;
  }
}

export async function burnNotification(userId, notificationId) {
  try {
      // Ensure the notification belongs to the authenticated user

      // Find the notification
      const notification = await client.notification.findFirst({
          where: {
              id: notificationId,
              userId: userId // Ensure the notification belongs to the user
          }
      });

      if (!notification) {
          return false
      }

      // Delete the notification
      await client.notification.delete({
          where: {
              id: notificationId
          }
      });

      return true
  } catch (error) {
      console.error("Error removing notification:", error);
      return false
  }
}



