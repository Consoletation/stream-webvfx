using System;
using UnityEngine;
using System.Collections;

namespace UnityStandardAssets.ImageEffects
{
    [ExecuteInEditMode]
    [AddComponentMenu("Image Effects/Color Adjustments/Sepia Tone")]
	public class Negative : ImageEffectBase
	{
		public float m_negative = 0.0f;
		public int m_pictsPerSession;
		public bool m_usePicture;
        
		private Texture[] m_pictures;
		private int m_cPicture;
		private float m_lastShow;
		private bool m_canShow = true;


		void Awake()
		{
			m_pictures = Resources.LoadAll<Texture> ("Images/");

			m_lastShow = -15;
		}

		void OnRenderImage (RenderTexture source, RenderTexture destination)
		{
			material.SetFloat ("_Negative", m_negative);
			material.SetInt ("_UsePicture",!m_canShow ? 1 : 0);

            Graphics.Blit (source, destination, material);
        }

		void Update()
		{


			if (Time.time > m_lastShow + 20 && m_canShow)
				StartCoroutine(ShowPictures());
		}


		IEnumerator ShowPictures()
		{
			m_canShow = false;

			int len = m_pictures.Length;

			for (int i = 0; i < len; i++) {

				material.SetTexture ("_PictTexture", m_pictures[i]);
				yield return new WaitForSeconds(0.01f);
			}

			yield return new WaitForSeconds(2);

			m_lastShow = Time.time;
			m_canShow = true;
		}

    }
}
