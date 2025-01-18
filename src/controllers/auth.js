export const handleGoogleLoginSuccuss = async (req, res) => {
  let url = req.cookies.url;
  res.cookie("url", "");
  req.login(req.user, (err) => {
    if (err) {
      return next(err);
    }
  });
  console.log(url);
  res.redirect(url || "/api/auth");
};
