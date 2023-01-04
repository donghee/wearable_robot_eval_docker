FROM osrf/ros:foxy-desktop
MAINTAINER Donghee Park <dongheepark@gmail.com> RUN whoami

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ros-foxy-gazebo-dev \
    ros-foxy-gazebo-plugins \
    ros-foxy-gazebo-msgs \
    ros-foxy-gazebo-ros-pkgs \
    ros-foxy-gazebo-ros \
    ros-foxy-ros-core \
    ros-foxy-geometry2 \
    ros-foxy-joint-state-publisher-gui \
    ros-foxy-xacro \
    ros-foxy-gazebo-ros2-control \
    ros-foxy-ros2-controllers \
    ros-foxy-controller-manager \
    ros-foxy-gazebo-ros2-control \
    ros-foxy-ros2-controllers \
    supervisor \
    openbox \
    lxsession \
    tilix \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# turbovnc
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglu1 \
    libsm6 \
    libxv1 \
    libxtst6 \
    libegl1-mesa \
    x11-xkb-utils \
    xauth \
    xfonts-base \
    xkb-data \
    nginx \ 
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

ARG TURBOVNC_VERSION=3.0.2
ARG VIRTUALGL_VERSION=3.0.90
ARG LIBJPEG_VERSION=2.1.4

RUN cd /tmp && \
    curl -O https://jaist.dl.sourceforge.net/project/turbovnc/${TURBOVNC_VERSION}/turbovnc_${TURBOVNC_VERSION}_amd64.deb

RUN cd /tmp && \
    curl -O https://jaist.dl.sourceforge.net/project/libjpeg-turbo/${LIBJPEG_VERSION}/libjpeg-turbo-official_${LIBJPEG_VERSION}_amd64.deb

RUN cd /tmp && \
    curl -O https://jaist.dl.sourceforge.net/project/virtualgl/3.0.90%20%283.1beta1%29/virtualgl_${VIRTUALGL_VERSION}_amd64.deb

#RUN cd /tmp && \
    #curl -O https://jaist.dl.sourceforge.net/project/virtualgl/3.0.90%20%283.1beta1%29/virtualgl32_${VIRTUALGL_VERSION}_amd64.deb

RUN cd /tmp && \
    dpkg -i *.deb && \
    rm -f /tmp/*.deb && \
    sed -i 's/$host:/unix:/g' /opt/TurboVNC/bin/vncserver

ENV PATH ${PATH}:/opt/VirtualGL/bin:/opt/TurboVNC/bin

# noVNC cooking
WORKDIR /opt/
RUN git clone https://github.com/novnc/noVNC.git
# Avoid another checkout when launching noVnc
WORKDIR /opt/noVNC/utils/
RUN git clone https://github.com/novnc/websockify

# Comfort
WORKDIR /var/log/supervisor/

# Not seems to work, but...
RUN export DISPLAY=:0.0

# Prepare X11, x11vnc, mate and noVNC from supervisor
COPY supervisord.conf /etc/supervisor/supervisord.conf

# Be sure that the noVNC port is exposed
#EXPOSE 8083

ARG PACKAGE_NAME=tilix
ARG EXECUTABLE_NAME=${PACKAGE_NAME}

# substitute in proper command name from args
RUN sed -i "s|SUBST_EXECUTABLE_NAME|${EXECUTABLE_NAME}|g" /etc/supervisor/supervisord.conf

WORKDIR /root/

# code server
RUN curl -fsSL https://code-server.dev/install.sh | sh
# Replaces "auth: password" with "auth: none" in the code-server config.
#RUN sed -i.bak 's/auth: password/auth: none/' /root/.config/code-server/config.yaml
RUN mkdir -p /root/.config/code-server/
COPY config.yaml /root/.config/code-server/config.yaml
#EXPOSE 8080

# nginx
COPY nginx.conf /etc/nginx/sites-available/default
RUN /etc/init.d/nginx restart
#EXPOSE 80

# project
WORKDIR /root/
RUN mkdir -p /root/ros2_ws/src/
WORKDIR /root/ros2_ws/src/
RUN git clone https://github.com/donghee/wearable_robot_eval.git

# Launch X11, x11vnc, mate and noVNC from supervisor
CMD ["/usr/bin/supervisord"]
