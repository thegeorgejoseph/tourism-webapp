class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // console.log(this.queryString);
    const exclude = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...this.queryString };
    exclude.forEach((val) => delete queryObj[val]);
    // console.log(this.queryString, queryObj);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // console.log(req.query);
    this.query = this.query.find(JSON.parse(queryStr));
    console.log(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sorter = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sorter);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip > numTours) throw new Error('Page does not exist!');
    // }
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
