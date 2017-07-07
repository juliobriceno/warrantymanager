function cargaProd(){

/*
		index='cargaProd';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		aaaa=respuesta;
		},
		async: false
		})
		$('#www').html(aaaa);


		index='cargaDestacados';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		aaaa=respuesta;
		},
		async: false
		});
		$('#destacados').html(aaaa);


		index='categoriaProductoFiltro';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		aaaa=respuesta;
		},
		async: false
		});
		$('#categoriaProductoFiltro').html(aaaa);	

*/
		index='cargaSliderPrincipal';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		resp=jQuery.parseJSON(respuesta);
		divimg=resp['divimg'];
		modalol=resp['modalol'];		
		modalol2=resp['modalol2'];
				modalol3=resp['modalol3'];
						modalol4=resp['modalol4'];
		},
		async: false
		});

		$('#slider_princ1').html(divimg);
		$('#olslider_princ1').html(modalol);
		$('#slider_princ2').html(divimg);
		$('#olslider_princ2').html(modalol2);
		$('#slider_princ3').html(divimg);
		$('#olslider_princ3').html(modalol3);
		$('#slider_princ4').html(divimg);
		$('#olslider_princ4').html(modalol4);

		index='cargaReceta';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		resp=jQuery.parseJSON(respuesta);
		receta1res=resp['receta1res'];
				receta1=resp['receta1'];
		receta2=resp['receta2'];
		receta3=resp['receta3'];
		receta4=resp['receta4'];
		select_receta1=resp['select_receta1'];
		select_receta2=resp['select_receta2'];
		select_receta3=resp['select_receta3'];
		select_receta4=resp['select_receta4'];		
		aaaa=respuesta;

		},
		async: false
		});
		$('#receta1res').html(receta1res);
		$('#receta1').html(receta1);
		$('#receta2').html(receta2);
		$('#receta3').html(receta3);
		$('#receta4').html(receta4);
		$('#select_receta1').html(select_receta1);
		$('#select_receta2').html(select_receta2);
		$('#select_receta3').html(select_receta3);
		$('#select_receta4').html(select_receta4);



		index='cargaNoticias';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		resp=jQuery.parseJSON(respuesta);
		not1=resp['not1'];
		noticias1=resp['noticias1'];
		not2=resp['not2'];
		noticias2=resp['noticias2'];
		not3=resp['not3'];
		noticias3=resp['noticias3'];
		not4=resp['not4'];
		noticias4=resp['noticias4'];
		not5=resp['not5'];
		noticias5=resp['noticias5'];
		not6=resp['not6'];
		noticias6=resp['noticias6'];
		aaaa=respuesta;

		},
		async: false
		});
		$('#not1').html(not1);
		$('#noticias1').html(noticias1);
		$('#not2').html(not2);
		$('#noticias2').html(noticias2);
		$('#not3').html(not3);
		$('#noticias3').html(noticias3);
		$('#not4').html(not4);
		$('#noticias4').html(noticias4);
		$('#not5').html(not5);
		$('#noticias5').html(noticias5);
		$('#not6').html(not6);
		$('#noticias6').html(noticias6);



		index='cargaTestimonios';
		$.ajax({
		type: "POST",
		url: 'funcionesPhp.php',
		data: 'index='+index,
		success: function(respuesta){
		resp=jQuery.parseJSON(respuesta);
		testimonial1=resp['testimonial1'];
		testimonial2=resp['testimonial2'];
		testimonial3=resp['testimonial3'];
		testimonial4=resp['testimonial4'];
		testimonial5=resp['testimonial5'];
		testimonial6=resp['testimonial6'];

		},
		async: false
		});
		//alert(testimonial1);
		
		$('#tb-testimonial1').html(testimonial1);
		$('#tb-testimonial2').html(testimonial2);
		$('#tb-testimonial3').html(testimonial3);
		$('#tb-testimonial4').html(testimonial4);
		$('#tb-testimonial5').html(testimonial5);
		$('#tb-testimonial6').html(testimonial6);
}


function calculoImc(){
		peso= $('#peso_imc').val();
		altura= $('#altura_imc').val();
		imc=peso*altura;
		$('#resultado_imc').val(imc);

}


