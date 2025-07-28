const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      const error = new Error("User not authenticated");
      error.status = 401;
      return next(error);
    }

    const isAdmin = user.role === "admin";
    if (!isAdmin) {
      const error = new Error("User is not an admin");
      error.status = 403;
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default isAdmin;
