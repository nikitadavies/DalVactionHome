import React from 'react';

const Statistics = () => {
  const reportUrl = 'https://lookerstudio.google.com/embed/reporting/fea13967-dc79-4eb8-9529-625b236652cb/page/y0z6D';

  return (
    <div style={{marginTop: "30px"}}>
      <h2>Admin Dashboard</h2>
      <iframe
        title="Looker Studio Report"
        width="100%"
        height="600"
        src={reportUrl}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Statistics;
