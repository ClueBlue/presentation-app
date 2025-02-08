# Use an official Nginx image
FROM nginx:alpine

# Copy custom configuration file
x.conf /etc/nginx/nginx.conf

# Copy web files to the Nginx HTML directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
