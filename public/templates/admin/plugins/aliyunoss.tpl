<h1>Aliyun OSS</h1>


<form role="form" class="form">
	<div class="form-group">
        <label>Aliyun OSS Key</label>
        <input id="aliyun-oss-domain" data-field="domain" type="text" class="form-control" placeholder="Enter Aliyun OSS Domain">
        <input id="aliyun-oss-bucket" data-field="bucket" type="text" class="form-control" placeholder="Enter Aliyun OSS Bucket">
        <input id="aliyun-oss-accesskeyid" data-field="accessKeyId" type="text" class="form-control" placeholder="Enter Aliyun OSS AccessKeyId">
        <input id="aliyun-oss-secretaccesskey" data-field="secretAccessKey" type="text" class="form-control" placeholder="Enter Aliyun OSS SecretAccessKey">
    </div>
	<button class="btn btn-lg btn-primary" id="save">Save</button>
</form>

<script type="text/javascript">


    $('#save').on('click', function() {

        $.post('/api/admin/plugins/upload-aliyun-oss/save', {
            _csrf : $('#csrf_token').val(),
            ossConfig : {
                domain: $('#aliyun-oss-domain').val(),
                bucket: $('#aliyun-oss-bucket').val(),
                accessKeyId: $('#aliyun-oss-accesskeyid').val(),
                secretAccessKey: $('#aliyun-oss-secretaccesskey').val()
            }
        }, function(data) {
            app.alertSuccess(data.message);
        });

        return false;
    });

</script>