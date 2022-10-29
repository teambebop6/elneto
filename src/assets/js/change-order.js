/**
 * Created by Henry Huang on 2022/10/29.
 */
const changeTableRow = (targetId, up) => {
  const target = $(`#${targetId}`);
  let transitionTime = 500;
  if (up) {
    if (target.prev().length > 0) {
      target.after(target.prev());
    } else {
      transitionTime = 1000;
      target.siblings().last().after(target);
    }
  } else {
    if (target.next().length > 0) {
      target.before(target.next());
    } else {
      transitionTime = 1000;
      target.siblings().first().before(target);
    }
  }
  $('html, body').animate({scrollTop: target.offset().top -100 });
  target.css({
    color: 'black'
  })
  target.transition('glow', transitionTime, () => {
    target.css({
      color: 'white'
    })
  });
}

module.exports = changeTableRow;
