var shaderFactory = {
    getFile: function(filename) {
        var source = "";
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                source = xmlhttp.responseText;
                console.log(filename + " loaded with \n" + source);
            } else console.log("GET " + filename + " failed with " + this.status);
        };
        xmlhttp.open("GET", filename, false);
        xmlhttp.send();
        return source;
    },
    getShader: function(gl, file, id) {
        var str = this.getFile(file);
        var shader = gl.createShader(id);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    loadProgram: function(gl, fs, vs) {
        var shaderProgram;
        console.log("loading shaders: " + fs + " and " + vs);
        var fragmentShader = this.getShader(gl, fs, gl.FRAGMENT_SHADER);
        var vertexShader = this.getShader(gl, vs, gl.VERTEX_SHADER);
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        gl.useProgram(shaderProgram);
        return shaderProgram;
    },

};

var context = {
    canvas: null,
    gl: null,
    init: function() {
        console.log("initializing canvas");
        this.canvas = document.getElementById("canvas");
        this.initGL();
    },
    initGL: function() {
        console.log("getting webGL context")
        try {
            this.gl = canvas.getContext("webgl2");
            this.gl.viewportWidth = canvas.clientWidth;
            this.gl.viewportHeight = canvas.clientHeight;
            //this.gl.viewport(0, 0, canvas.width, canvas.height);
            console.log(this.gl.getParameter(this.gl.VIEWPORT));
        } catch (e) {
            console.log("webgl context fail with:" + e)
        }

        this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
    }


};

function buildMesh(gl, vertices, vecSize) {
    var mesh = { vao: null, vbo: null };
    mesh.vao = gl.createVertexArray();
    gl.bindVertexArray(mesh.vao);
    mesh.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    mesh.vbo.itemSize = vecSize;
    mesh.vbo.numItems = vertices.length / vecSize;
    mesh.draw = function(gl, method, program) {
        gl.bindVertexArray(this.vao);
        gl.vertexAttribPointer(program.vpa, mesh.vbo.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(method, 0, this.vbo.numItems);
    };
    return mesh;
};

var mesh;

function initBuffers(gl) {
    mesh = buildMesh(gl, [
        1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0, -1.0, -1.0, 0.0
    ], 3);
}

var modifiers = { xSlider: 0, ySlider: 0, zoomSlider: 1, maxSlider: 50 };

function updateModifier(id) {
    var slider = document.getElementById(id);
    modifiers[id] = slider.value;
    console.log(id + " is " + slider.value);
}

var count = 0;

function drawScene(context, program) {
    var gl = context.gl;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.uniform2f(gl.getUniformLocation(program, "iResolution"), context.canvas.clientWidth, context.canvas.clientHeight);
    gl.uniform2f(gl.getUniformLocation(program, "pos"), modifiers.xSlider, modifiers.ySlider);
    gl.uniform1f(gl.getUniformLocation(program, "zoom"), modifiers.zoomSlider);
    gl.uniform1i(gl.getUniformLocation(program, "maxIter"), modifiers.maxSlider);
    gl.uniform1f(gl.getUniformLocation(program, "time"), count);
    mesh.draw(gl, gl.TRIANGLE_STRIP, program);
    count += .1;
}

function webGLStart() {
    context.init();
    var gl = context.gl;
    initBuffers(gl);
    var program = shaderFactory.loadProgram(gl, "fragment.glsl", "vertex.glsl");

    program.vpa = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vpa);

    drawScene(context, program);
    setInterval(drawScene, 10, context, program);
}