const validateFields = (fieldsArray) => {
  return (req, res, next) => {
    const errors = {};

    for (const value in req.body) {
      if (req.body[value] === "0") {
        req.body[value] = Number(req.body[value]);
      }
    }

    const fields = fieldsArray.map((field) => field.name);
    fieldsArray.forEach((field) => {
      if (req.body[field.name].length > field.maxLength) {
        errors[field.name] = `${field.label} max length is ${field.maxLength}`;
      }
    });

    for (const field of fields) {
      if (!req.body[field]) {
        errors[field] = `${field} is required`;
      }
    }

    if (Object.keys(errors).length !== 0) {
      return res.status(400).json({ err: errors });
    }
    next();
  };
};

module.exports = validateFields;
