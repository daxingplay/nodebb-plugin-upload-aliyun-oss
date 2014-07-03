
'use strict';

//my first nodebb plugin

var request = require('request'),
	winston = require('winston'),
	fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    db = module.parent.require('./database');


(function(aliyunOss) {
    var ossConfig = {};

    db.getObject("config", function(err,options) {
        if(err) {
            return winston.error(err.message);
        }
        ossConfig = options;
    });

    aliyunOss.init = function(app, middleware, controllers) {
        app.get('/admin/plugins/upload-aliyun-oss', middleware.admin.buildHeader, renderAdmin);
        app.get('/api/admin/plugins/upload-aliyun-oss', renderAdmin);

        app.post('/api/admin/plugins/upload-aliyun-oss/save', save);
	};

    function renderAdmin(req, res, next) {
        db.getObjectField('nodebb-plugin-upload-aliyun-oss', ['domain','bucket','accessKeyId','secretAccessKey'], function(err, policy) {
            if (err) {
                return next(err);
            }

            res.render('admin/plugins/upload-aliyun-oss', policy);
        });
    }

    function save(req, res, next) {
        if(req.body.ossConfig !== null && req.body.ossConfig !== undefined) {
            db.setObject('nodebb-plugin-upload-aliyun-oss', req.body.ossConfig, function(err) {
                if (err) {
                    return next(err);
                }

                ossConfig = req.body.ossConfig;
                res.json(200, {message: 'OSS Config saved!'});
            });
        }
    }

    aliyunOss.upload = function (image, callback) {
		if(!ossConfig.accessKeyId) {
			return callback(new Error('invalid-aliyun-oss-access-key-id'));
		}
        if(!ossConfig.secretAccessKey) {
            return callback(new Error('invalid-aliyun-oss-secret-access-key'));
        }
        if(!ossConfig.bucket) {
            return callback(new Error('invalid-aliyun-oss-bucket-name'))
        }
        if(!ossConfig.domain) {
            return callback(new Error('invalid-aliyun-oss-domain'))
        }

		if(!image || !image.path) {
			return callback(new Error('invalid image'));
		}

        uploadToOss(ossConfig.accessKeyId, ossConfig.secretAccessKey, ossConfig.bucket, ossConfig.domain, image, function(err, data) {
            if(err) {
                return callback(err);
            }

            callback(null, {
                url: data,
                name: image.name
            });
        });

	};

	function uploadToOss(accessKeyId,secretAccessKey,bucket,domain, image, callback) {
        var ALY = require('./node_modules/aliyun-sdk/lib/aws');
        ALY.config = {accessKeyId:accessKeyId,secretAccessKey:secretAccessKey};
        //http://oss-cn-hangzhou.aliyuncs.com
        var oss = new ALY.OSS({
            endpoint: domain,
            apiVersion: '2013-10-15'
        });
        fs.readFile(image.path,function(err,data) {
            if(err) {
                return callback(err)
            }

            var hash = crypto.createHash('md5');
            var hex = hash.update(data+"").digest('hex');
            var dir = hex.slice(0,3),
                sub = hex.slice(3,6),
                name = hex.slice(6),
                ext = image.name.split('.')[image.name.split(".").length-1];

            var domain_none_http = domain.replace("http://","");
            var object_name = dir + '/' + sub + '/' + name + '.' + ext;
            var url = 'http://' + bucket + '.' + domain_none_http + '/' + object_name;

            oss.putObject({

                Bucket : bucket,
                Key : object_name,
                Body : data,
                ContentType : 'image/'+ext

            },function(err,data){
                if(err) {
                    return callback(err)
                }
                callback(null,url)
            })
        });
	}

	var admin = {};

	admin.menu = function(custom_header, callback) {
		custom_header.plugins.push({
			route: '/plugins/upload-aliyun-oss',
			icon: 'fa-picture-o',
			name: 'Aliyun OSS'
		});

        callback(null, custom_header);
	};

    aliyunOss.admin = admin;

}(module.exports));

