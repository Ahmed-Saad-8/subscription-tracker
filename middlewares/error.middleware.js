const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    if (error.name == "CastError") {
      const message = "Resource not found";

      error = new Error(message);
      error.statusCode = 404;
    }

    if (err.code == 11000) {
      const message = "Duplicate field value entered";

      error = new Error(message);
      error.statusCode = 400;
    }

    if (error.name == "ValidationError") {
      const message = Object.values(err.message).map(val.message);

      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    res
      .status(error.statusCode || 500)
      .json({ succes: false, error: error.message } || "server error");
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
