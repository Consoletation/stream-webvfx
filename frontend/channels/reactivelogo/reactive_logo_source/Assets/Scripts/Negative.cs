using System;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace UnityStandardAssets.ImageEffects
{
    [ExecuteInEditMode]
    [AddComponentMenu("Image Effects/Color Adjustments/Sepia Tone")]
	public class Negative : ImageEffectBase
	{
		public float m_negative = 0.0f;
		public int m_pictsPerSession;
		public bool m_usePicture;
        
		private List<Texture> m_pictures;
		private int m_cPicture;
		private float m_lastShow;
		private bool m_canShow = true;
		private bool m_newImage;
		private int m_cPict;

		void Awake()
		{
			m_pictures = new List<Texture> ();
			m_lastShow = -10;

			m_cPict = PlayerPrefs.GetInt("cPict");
		}

		public void AddPictures(Texture2D pict)
		{
			if (m_pictures == null)
				m_pictures = new List<Texture> ();

			m_newImage = true;

			m_pictures.Add (pict);
		}

		void OnRenderImage (RenderTexture source, RenderTexture destination)
		{
			material.SetFloat ("_Negative", m_negative);
			material.SetInt ("_UsePicture",!m_canShow ? 1 : 0);

            Graphics.Blit (source, destination, material);
        }

		void Update()
		{
			if (m_pictures.Count > 0  && Time.time > m_lastShow + 15 && m_canShow)
				StartCoroutine(ShowPictures());
		}


		IEnumerator ShowPictures()
		{
			m_canShow = false;

			int len = m_pictures.Count;

			for (int i = 0; i < len; i++) {

				material.SetTexture ("_PictTexture", m_pictures[i]);
				yield return new WaitForSeconds(0.03f);
			}

			if (!m_newImage) {

				if(m_cPict >= m_pictures.Count)
					m_cPict = 0;

				material.SetTexture ("_PictTexture", m_pictures[m_cPict]);

				m_cPict++;
			}

			PlayerPrefs.SetInt("cPict" , m_cPict);

			yield return new WaitForSeconds(5);

			m_lastShow = Time.time;
			m_canShow = true;
			m_newImage = false;


		}

    }
}
