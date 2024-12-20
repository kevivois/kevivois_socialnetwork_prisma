import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import PrismaSingleton  from './Connection.js'; // Adjust the path to your file if needed


const client = new PrismaSingleton().client;

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    const user = await client.user.findFirst({
      where: {
        username: username,
      }
    })
    if (!user) {
      return done(null, false, { message: 'No user with that username' });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await client.user.findFirst({
      where:{
        id:id
      }
    })
    done(null, user);
  });
}

export default initialize;
