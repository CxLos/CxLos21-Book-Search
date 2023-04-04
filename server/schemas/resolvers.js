const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
// const { getSingleUser } = require('../controllers/user-controller');

const resolvers = {

    Query: {
      profiles: async () => {
        return User.find();
      },
  
      profile: async (parent, { profileId }) => {
        return User.findOne({ _id: profileId });
      },
    },

    Mutation: {

        login: async (parent, { email, password }) => {
            const profile = await User.findOne({ email });

            if (!profile) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await profile.isCorrectPassword(password);
            if(!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }
            const token = signToken(profile);
            return { token, profile };
        },

        addUser: async (parent, { username, email, password }) => {
            const profile = await User.create({ username, email, password });
            const token = signToken(User);
            return { token, profile };
        },
        saveBook: async (parent, { userId, book }) => {
            return User.findOneAndUpdate(
                { _id: userId },
                {
                  $addToSet: { savedBooks: book },
                },
                {
                  new: true,
                  runValidators: true,
                }
              );
        },
        removeBook: async (parent, { userId, book }) => {
            return Profile.findOneAndUpdate(
                { _id: userId },
                { $pull: { savedBooks: book } },
                { new: true }
              );
        },
    },
};

module.exports = resolvers;