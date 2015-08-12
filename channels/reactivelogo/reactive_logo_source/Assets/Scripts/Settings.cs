using UnityEngine;
using System.Collections;

public class Settings {

	private static Color[] m_colors = new Color[3]{new Color(206 / 256.0f,23/ 256.0f,72/ 256.0f),new Color(252 / 256.0f,164/ 256.0f,18/ 256.0f),new Color(20 / 256.0f,171/ 256.0f,190/ 256.0f)};

	public static Color GetRandomColor()
	{
		return m_colors[Random.Range(0,m_colors.Length)];
	}

}


/*
bg: #efefef
text:#000000
red: #ce1748
blue: #14abbe
yellow:  #fca412

 */