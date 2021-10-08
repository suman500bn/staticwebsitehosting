<h1>Static Website Hosted on S3</h1>

<h2> Overview </h2>
<p>Status: In Review<br>
Creator: Suman Kalapatapu<br>
Date: 10/09/2021<br>
</p>


![image](https://user-images.githubusercontent.com/61553789/136497656-4e06a0bd-132f-4cc6-b76d-b64d46718027.png)


Design Considerations:

From the requirement, website hosted on s3 should support HTTPS, SSL, WAF. From my research AWS WAF can be configured with API Gateway, Load Balancer and CloudFront. My design choice is to go with Cloudfront distribution. Because it supports https endpoint with SSL and website can be served globally.
To serve a static website hosted on Amazon S3, you can deploy a CloudFront distribution using one of these configurations:
•	Using a REST API endpoint as the origin, with access restricted by an origin access identity (OAI)
•	Using a website endpoint as the origin, with anonymous (public) access allowed
•	Using a website endpoint as the origin, with access restricted by a Referer header

Going with public access to s3 is a security risk. So in this project, I have followed access restricted by Cloudfront OAI.

Steps I have followed to accomplish the task:

Using a REST API endpoint as the origin, with access restricted by an OAI
1.	I have written template to provision Amazon S3 bucket and upload website files. For this I am using REST API endpoint configuration of the bucket instead of the website endpoint from the enable static website hosting feature. Advantages of REST API endpoint is it supports both public and private content whereas website endpoint supports only public content. 
2.	Create a CloudFront web distribution. In addition to the distribution settings that you need for your use case, enter the following:
    Bucket Origin domain
    Enabling Cloudfront OAI S3 bucket access by updating bucket policy
    Adding CORS policy for allowing external api calls.
3. Create AWS WAF rules.
4.	It's a best practice to use SSL (HTTPS) for the website. To use a custom domain with HTTPS, we need Custom SSL certificate. If we are not using a custom domain, we can still use HTTPS with the cloudfront.net domain name for your distribution.
Important: If Alternate domain names (CNAMEs) is entered for cloudfront distribution, then the CNAMEs must match the SSL certificate that we select. 
5.	Create CloudFront Distribution with s3 as origin,attaching custom domain name and applying WAF rules.
6.	Update the DNS records for our domain to point website's CNAME CloudFront distribution's domain name. You can find your distribution's domain name in the CloudFront console in a format that's similar to d1234abcd.cloudfront.net.

[a link](https://github.com/suman500bn/staticwebsitehosting/blob/master/web-infra/README.md)



