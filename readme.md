<h1>Static Website Hosted on S3</h1>

<h2> Overview </h2>
<p>Status: In Review<br>
Creator: Suman Kalapatapu<br>
Date: 10/09/2021<br>
</p>


![image](https://user-images.githubusercontent.com/61553789/136578216-aa2340a7-992f-4e89-b6ba-6f59343db49b.png)


Design Considerations:

From the requirement, website hosted on s3 should support HTTPS, SSL, WAF. From my research AWS WAF can be configured with API Gateway, Load Balancer and CloudFront. My design choice is to go with Cloudfront distribution. Because it supports https endpoint with SSL and website can be served globally.<br>

To serve a static website hosted on Amazon S3, you can deploy a CloudFront distribution using one of these configurations:<br>
•	Using a REST API endpoint as the origin, with access restricted by an origin access identity (OAI)<br>
•	Using a website endpoint as the origin, with anonymous (public) access allowed<br>
•	Using a website endpoint as the origin, with access restricted by a Referer header<br>

Going with public access to s3 is a security risk. So in this project, I have followed access to Cloudfront OAI.<br>

Steps I have followed to accomplish the task:<br>

Using a REST API endpoint as the origin, with access restricted by an OAI<br>

1.	I have written template to provision Amazon S3 bucket and upload website files. For this I am using REST API endpoint configuration of the bucket instead of the website endpoint from the enable static website hosting feature. Advantages of REST API endpoint is it supports both public and private content whereas website endpoint supports only public content. <br>
2.	Created a CloudFront web distribution. In addition to the distribution settings, enter the following:<br>
    Bucket Origin domain<br>
    Enabling Cloudfront OAI S3 bucket access by updating bucket policy<br>
    Adding CORS policy for allowing external api calls.<br>
3. Create AWS WAF rules.<br>
4.	It's a best practice to use SSL (HTTPS) for the website. To use a custom domain with HTTPS, we need Custom SSL certificate. If we are not using a custom domain, we can still use HTTPS with the cloudfront.net domain name for your distribution.<br>
5.	Create CloudFront Distribution with s3 as origin,attaching custom domain name and applying WAF rules.<br>
6.	Update the DNS records for our domain to point website's CNAME CloudFront distribution's domain name. You can find your distribution's domain name in the CloudFront console in a format that's similar to d1234abcd.cloudfront.net.<br>

## Folder Structure
    web-infra contains infrastructure template <br>
    website contains website details <br>
    .github/workflows contains CI/CD pipeline file <br>

## [Checkout Details about CDK Template](https://github.com/suman500bn/staticwebsitehosting/blob/master/web-infra/README.md)

## CI/CD Pipeline details:

So i have created basic pipeline to deploy web infrastructure to AWS. I used Git Actions for CI/CD pipeline. I used pilot environment and setup environmental variables under environment section in settings tab of github. Please refer .env examples for environmental variables i am using in this project.Pipeline is setup in such a way that whenever change is made to website folder pipeline is triggered

## Commands in git actions:

    cdk bootstrap: to configure aws environment<br>
    cdk synth WebInfraStack: to synthesize and view the cloud formation template for stack we requested<br>
    cdk deploy WebInfraStack --require-approval never: to deploy our stack into AWS<br>

## Implemented Tasks:
   CDK Template <br>
   Support a custom domain name<br>
   Support SSL <br>
   Support WAF (rules need to be configured) <br>
   SPA is deployed by pushing static index.html and other web resources <br>
   Enabled approval for pull request so that only authorized user can appovr changes to aws.
   
## [Checkout Workflow Runs](https://github.com/suman500bn/staticwebsitehosting/actions/workflows/deployment.yml)

## Assumptions
   Custom WAF rules provision is created.What rules should go in there whether IP SET or managed rules group need to be decided by the team using this.<br>
   DNS record is already created in Route 53.
   
## Additional Tasks:
   Though CORS is enabled in bucket policy. Should make changes in cloudfront to allow external api calls.<br>
   Certain Parameters like domainname, subdomain, whitelisted IP are hard coded. Need to create config file or take parameters from environmental variables for resusability.<br>
   

## References:

https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html#WebsiteRestEndpointDiff <br>
https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudfront-readme.html <br>



