import React from 'react';
import Layout from '../components/layout/layout';
import SEO from '../components/seo';

const Success = ({ data, location }) => {
    return (
	    <Layout location={location}>
	      <SEO title="Success" />
	      <div style={{ display: `flex`, flexDirection: `column`, height: `50vh`, padding: `1rem` }}>
	        <div style={{ flex: `1` }}>
	          <div>
	          	<h1>Success!</h1>
				<p>The order was placed.</p>
		      </div>
	      	</div>
	      </div>
	    </Layout>
    )
}

export { Success as default }